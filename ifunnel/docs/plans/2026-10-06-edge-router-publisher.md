# iKame Funnel Platform — Edge Router + Publisher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa funnel HTML có sẵn (`funnel/funnel-development/**/demo.html`) lên domain thật để chạy ads. Người làm funnel chạy `ikf publish` để tạo version bất biến có link preview, rồi `ikf route set` / `ikf route rollback` để gắn hoặc gỡ funnel khỏi traffic thật. Funnel được phục vụ hoàn toàn từ Cloudflare edge, không phụ thuộc core khi chạy.

**Architecture:**
- **CLI `ikf`** (máy local): chạy lint + smoke có sẵn, gửi `demo.html` lên Publisher API, quản lý route.
- **Publisher trong `core-api`** (ECS): validate bundle, ghi R2, lưu `funnels`/`versions`/`routes` vào Postgres, rồi dựng lại toàn bộ route của host và ghi lên KV. Job nền mỗi phút chiếu lại các host có KV chậm hơn DB.
- **Worker `edge-router`**: `host + path` → KV (`cacheTtl` 30s, có bản dự phòng trong bộ nhớ 10 phút) → Cache API / R2 → chèn `window.__IKF` → trả HTML. Không bao giờ gọi core.
- **`@ikf/route-match`**: thư viện so khớp path prefix dùng chung cho Worker, core và CLI, nên ba nơi luôn chuẩn hóa và so khớp giống nhau.

**Tech Stack:** Node.js 22 (JavaScript ESM, cùng kiểu với `core-api` của plan infra) · npm workspaces · Fastify 5 · pg 8 · htmlparser2 10 · AWS SDK v3 (`client-s3` cho R2, `client-secrets-manager`) · Vitest 3.2 · `@testcontainers/postgresql` 11 · Cloudflare Workers + wrangler 4 + `@cloudflare/vitest-pool-workers` 0.8 · Terraform + Cloudflare provider `~> 5.0` · k6 · Playwright (qua `funnel/tools/smoke_demo.mjs` có sẵn).

**Spec:** `ifunnel/docs/specs/2026-10-06-edge-router-publisher-design.md`. Plan này phụ thuộc plan infra `ifunnel/docs/plans/2026-10-05-ikf-infra-aws.md` (Task 3, 7, 8, 9, 11, 12, 13 phải xong trước Task 15).

## Điều chỉnh so với spec (phát hiện khi khảo sát 67 `demo.html`, 2026-10-06)

Spec đã được cập nhật theo các điểm này trong cùng commit với plan.

| # | Spec ban đầu | Plan làm | Lý do |
|---|---|---|---|
| R1 | CLI dừng nếu HTML còn tham chiếu `img/...` | CLI chạy smoke trên **một bản `demo.html` đặt riêng trong thư mục tạm không có `img/`**. Ảnh nào chưa được map `IMG` trỏ sang URL thật sẽ không tải được, và smoke fail (`requestfailed`). Core kiểm tra mọi giá trị trong map `IMG` và mọi chuỗi `'img/....jpg'` tĩnh phải được map | Funnel gọi ảnh qua `im('img/x.jpg')` và map `/*IMG-START*/{...}/*IMG-END*/`, nên key `img/...` luôn còn trong HTML kể cả khi đã đổi sang URL S3 |
| R2 | Chèn `__IKF` bằng `HTMLRewriter`, lỗi thì trả HTML gốc | Chèn bằng thao tác chuỗi: sau `<head>`, nếu không có thì sau `<!doctype>`, nếu không có nữa thì đầu file. Không có nhánh lỗi | 21/67 demo không có `<head>`. Bundle ≤ 1MB nên đọc cả chuỗi vào bộ nhớ là chấp nhận được |
| R3 | Token cá nhân do core cấp (không nói cách cấp) | Thêm role `admin`, bảng `api_tokens` (chỉ lưu sha256), `POST /v1/tokens` (admin), token admin đầu tiên lấy từ secret `bootstrap-admin-token`. Domain đồng bộ qua `PUT /v1/domains/:host` (admin) bằng script sau `terraform apply` | Cần một đường cấp token và đồng bộ domain không phải SSH vào container |
| R4 | CLI yêu cầu `--yes` khi đổi funnel trên route | Core cũng chặn (`409 funnel_change_requires_confirmation`), CLI gửi `confirm_funnel_change: true` khi có `--yes` | Không để client khác (Admin sau này) bỏ qua bước xác nhận |
| R5 | — | 9/67 demo chưa có `CONFIG.funnel` → sẽ bị từ chối `slug_mismatch` cho tới khi người làm funnel thêm vào | Khớp đúng luật trong spec, ghi ra để không bất ngờ |

## Global Constraints

- Code nằm trong repo `ikf-platform` (`/Users/daothinh/ikf-platform`), không đặt trong repo `ikame`.
- Funnel HTML hiện có phải chạy **không sửa**, chỉ được inject (chèn) script.
- p95 TTFB trang funnel < 200ms toàn cầu, phục vụ từ edge cache.
- Phải chạy được trong **in-app browser của FB, IG và TikTok**.
- Đường nóng không ghi Postgres: Worker không bao giờ gọi core.
- Bundle ≤ 1MB (`1048576` byte UTF-8).
- R2 key: `bundles/<slug>/v<n>/index.html`. Object đã được version trong DB tham chiếu thì không bao giờ bị ghi đè hay xóa.
- KV key: `route:<host>`, value `{"rev": <int>, "routes": [{"prefix","bundle","funnel","v"}]}`, route sắp theo độ dài prefix giảm dần.
- Slug: `^[a-z0-9][a-z0-9-]{1,62}$`.
- `path_prefix` chuẩn hóa: bắt đầu bằng `/`, không có `/` cuối (trừ chính `/`), lowercase, đã decode percent-encoding.
- Thay đổi route có hiệu lực toàn cầu trong tối đa ~90 giây (KV ≤ 60s + `cacheTtl` 30s). Output CLI phải ghi rõ điều này.
- Ghi R2 **trước**, ghi row `versions` **sau**.
- Mọi media phải là `data:`, `#fragment`, nằm dưới `MEDIA_ORIGINS`, hoặc dưới `https://fonts.googleapis.com/` / `https://fonts.gstatic.com/`. `<script src>` ngoài: không cho phép (allowlist rỗng).
- Header HTML: `Content-Type: text/html; charset=utf-8`, `Cache-Control: no-cache`, `x-ikf: <funnel>@<v>; rev=<rev>`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`. Chưa đặt CSP.
- Preview: `preview.<zone>/<slug>/v<n>`, có `X-Robots-Tag: noindex` và `__IKF.preview = true`.
- Không có giá trị secret trong Terraform module (theo plan infra). Token API chỉ lưu sha256 trong DB.

## Review Focus

1. **Ảnh được ghép tên động** (`im('img/'+name+'.jpg')`) mà map `IMG` thiếu key: core không bắt được bằng regex. Người dùng mong ảnh không bị vỡ trên edge. Chặn bằng smoke trong thư mục tạm không có `img/` → test ở Task 14 (smoke nhận đúng đường dẫn thư mục tạm, không có `img/` bên cạnh).
2. **Demo không có `<head>`** (21/67): người dùng mong funnel vẫn hiển thị đúng và vẫn có `__IKF`. Test ở Task 10 (`inject` với 3 dạng tài liệu).
3. **Hai người `route set` cùng host một lúc**: KV cuối cùng phải khớp DB (cùng `rev`, cùng version). Test ở Task 7 (5 lệnh `set` song song).
4. **URL quảng cáo có chữ hoa, `/` cuối, percent-encoding và query `fbclid`**: phải ra đúng funnel, và query không làm lệch cache. Test ở Task 1 (`normalizePath`) và Task 10 (`/TikTok-UGC/?fbclid=...`).
5. **Mạng chập chờn khi chạy CLI**: `publish` retry không được sinh version trùng, còn `rollback`/`rm` **không được tự retry**, vì retry sau khi lệnh đầu đã thành công sẽ rollback thêm một lần nữa. Test ở Task 6 (publish trùng sha) và Task 13 (client không retry `rollback`).

## File Structure (repo `ikf-platform`, phần mới/sửa)

```
ikf-platform/
├── package.json                         # MỚI: npm workspaces
├── package-lock.json                    # MỚI: lock chung (thay lock riêng của core-api)
├── .dockerignore                        # MỚI: build context là gốc repo
├── .github/workflows/
│   ├── core-api.yml                     # SỬA: npm ci ở gốc, build từ gốc
│   ├── edge-router.yml                  # MỚI: test + wrangler deploy
│   ├── packages.yml                     # MỚI: test route-match + cli
│   └── infra.yml                        # SỬA: thêm module funnel-domains vào matrix
├── packages/
│   ├── route-match/
│   │   ├── package.json
│   │   ├── src/index.js                 # normalizePath, isValidPrefix, sortRoutes, matchRoute
│   │   └── test/route-match.test.js
│   └── cli/
│       ├── package.json                 # bin: ikf
│       ├── src/main.js                  # parse lệnh, in kết quả
│       ├── src/target.js                # host/prefix, funnel@vN
│       ├── src/credentials.js           # ~/.config/ikf/credentials
│       ├── src/api.js                   # HTTP client, retry có chọn lọc
│       ├── src/checks.js                # lint + smoke local
│       └── test/{target,api,checks,main}.test.js
├── services/core-api/
│   ├── package.json                     # SỬA: thêm deps
│   ├── Dockerfile                       # SỬA: build từ gốc repo
│   ├── vitest.config.js                 # MỚI: timeout cho Testcontainers
│   ├── migrations/001_publisher.sql
│   ├── scripts/validate-all.js          # chạy validator trên cả thư mục funnel
│   ├── src/app.js                       # SỬA: error handler, đăng ký plugin
│   ├── src/server.js                    # SỬA: config, secrets, migrate, resync
│   ├── src/config.js, src/secrets.js, src/errors.js, src/auth.js
│   ├── src/db/migrate.js
│   ├── src/http/{tokens,versions,routes,domains}.js
│   ├── src/publisher/{validate,bundle-store,route-kv,publish,routes,resync}.js
│   └── test/
│       ├── helpers/{db,fakes,app,pages}.js
│       └── {migrate,auth,validate,adapters,publish,routes,resync,config}.test.js
├── workers/edge-router/
│   ├── package.json, wrangler.json, vitest.config.js
│   ├── scripts/render-config.mjs        # sinh wrangler.deploy.json theo env
│   ├── src/{index,routes,bundle,inject,responses}.js
│   └── test/{inject,router,failures}.test.js
├── infra/modules/funnel-domains/        # MỚI: DNS + Worker route cho domain funnel và preview
├── infra/stack/{main,variables,outputs}.tf     # SỬA
├── infra/envs/{staging,prod}/{main.tf,terraform.tfvars}  # SỬA
├── scripts/sync-domains.sh              # MỚI
├── scripts/smoke-edge.sh                # MỚI
├── scripts/measure-propagation.sh       # MỚI
└── loadtest/edge-router.js              # MỚI
```

---

### Task 0: Chuẩn bị đầu vào (thủ công, không có code)

Ai làm: DevOps + PM. Phải xong trước Task 12 (Terraform) và Task 15 (staging). Task 1–11, 13, 14 làm được ngay.

- [ ] **Step 1: Thư viện media.** Hỏi team dựng thư viện S3 lấy **URL prefix công khai** cho staging và prod (ví dụ `https://media.<domain>/funnels/`). Prefix phải là `https://`. Ghi lại hai giá trị `MEDIA_ORIGINS`.
- [ ] **Step 2: Domain funnel.** Chọn domain (hoặc subdomain) funnel cho staging và cho pilot prod, ví dụ `try.<app-domain>`. Add zone vào Cloudflare account iKame, đổi nameserver. Ghi lại `host → zone_id` cho từng domain.
- [ ] **Step 3: Mở rộng token Terraform** (token của plan infra Task 0 Step 4): thêm `Zone: DNS:Edit` và `Zone: Workers Routes:Edit` cho **mọi zone funnel** và zone platform.
- [ ] **Step 4: Token cho Worker deploy.** Tạo Cloudflare API token `Account: Workers Scripts:Edit`, `Account: Workers KV Storage:Read`, `Account: Workers R2 Storage:Read`. Lưu vào GitHub environment secret `CLOUDFLARE_WORKERS_TOKEN` của cả `staging` và `prod`.
- [ ] **Step 5: Token cho core ghi KV.** Tạo Cloudflare API token `Account: Workers KV Storage:Edit` (giới hạn account iKame). Sau Task 12 apply, nhập vào secret `ikf/<env>/cf-kv-api-token`.
- [ ] **Step 6: Khóa R2 cho core.** R2 → Manage API tokens → tạo token `Object Read & Write`, giới hạn bucket `ikf-bundles-<env>`. Sau Task 12 apply, nhập Access Key ID vào `ikf/<env>/r2-access-key-id` và Secret vào `ikf/<env>/r2-secret-access-key`.
- [ ] **Step 7: Token admin đầu tiên.** Sinh chuỗi ngẫu nhiên: `node -e "console.log('ikf_'+require('crypto').randomBytes(32).toString('base64url'))"`. Sau Task 12 apply, nhập vào `ikf/<env>/bootstrap-admin-token`, đồng thời lưu vào password manager của team.

---

### Task 1: Workspaces + `@ikf/route-match` + đưa `core-api` vào workspace

**Files:**
- Create: `package.json`, `.dockerignore` (gốc repo)
- Create: `packages/route-match/package.json`, `packages/route-match/src/index.js`
- Test: `packages/route-match/test/route-match.test.js`
- Modify: `services/core-api/package.json` (thêm dependency `@ikf/route-match`), `services/core-api/Dockerfile`
- Delete: `services/core-api/package-lock.json`, `services/core-api/.dockerignore`
- Modify: `.github/workflows/core-api.yml` (job `test` và bước `docker/build-push-action`)

**Interfaces:**
- Produces (`@ikf/route-match`, dùng ở Task 7, 10, 13):
  - `normalizePath(raw: string): string`
  - `isValidPrefix(prefix: string): boolean` (true chỉ khi đã chuẩn hóa và chỉ gồm `[a-z0-9._~-]` theo từng segment)
  - `sortRoutes(routes: {prefix: string}[]): {prefix: string}[]` (bản sao, prefix dài trước)
  - `matchRoute(routes: {prefix: string}[], rawPath: string): route | null`
- Produces: lệnh build image mới `docker buildx build --platform linux/arm64 -f services/core-api/Dockerfile .` (chạy từ gốc repo).

- [ ] **Step 1: Tạo workspace gốc và package `route-match`**

```bash
cd /Users/daothinh/ikf-platform
cat > package.json <<'EOF'
{
  "name": "ikf-platform",
  "private": true,
  "workspaces": ["packages/*", "services/*", "workers/*"],
  "engines": { "node": ">=22" },
  "scripts": { "test": "npm test --workspaces --if-present" }
}
EOF
mkdir -p packages/route-match/src packages/route-match/test
cat > packages/route-match/package.json <<'EOF'
{
  "name": "@ikf/route-match",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": "./src/index.js",
  "scripts": { "test": "vitest run" },
  "devDependencies": { "vitest": "~3.2.0" }
}
EOF
```

- [ ] **Step 2: Viết test fail**

`packages/route-match/test/route-match.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { normalizePath, isValidPrefix, sortRoutes, matchRoute } from '../src/index.js';

describe('normalizePath', () => {
  it.each([
    ['', '/'],
    ['/', '/'],
    ['///', '/'],
    ['/TikTok-UGC/', '/tiktok-ugc'],
    ['tiktok-ugc', '/tiktok-ugc'],
    ['/a//b/', '/a/b'],
    ['/caf%C3%A9', '/café'],
    ['/a%2Fb', '/a/b'],
    ['/bad%E0%A4%A', '/bad%e0%a4%a'],
  ])('%j -> %j', (raw, expected) => {
    expect(normalizePath(raw)).toBe(expected);
  });
});

describe('isValidPrefix', () => {
  it.each(['/', '/v1', '/tiktok-ugc', '/a/b-2', '/x.y_z~1'])('accepts %j', (p) => {
    expect(isValidPrefix(p)).toBe(true);
  });
  it.each(['', 'v1', '/v1/', '/V1', '/a b', '/café', '/-x', '/a//b', 42])('rejects %j', (p) => {
    expect(isValidPrefix(p)).toBe(false);
  });
});

describe('sortRoutes', () => {
  it('puts longer prefixes first without mutating the input', () => {
    const input = [{ prefix: '/' }, { prefix: '/ab' }, { prefix: '/a' }, { prefix: '/aa' }];
    expect(sortRoutes(input).map((r) => r.prefix)).toEqual(['/aa', '/ab', '/a', '/']);
    expect(input[0].prefix).toBe('/');
  });
});

describe('matchRoute', () => {
  const routes = [
    { prefix: '/', v: 'root' },
    { prefix: '/v1', v: 'v1' },
    { prefix: '/tiktok-ugc', v: 'ugc' },
    { prefix: '/tiktok-ugc/eu', v: 'ugc-eu' },
  ];
  it.each([
    ['/v1', 'v1'],
    ['/v1/', 'v1'],
    ['/v1/step/3', 'v1'],
    ['/v10', 'root'],
    ['/TikTok-UGC/', 'ugc'],
    ['/tiktok-ugc/eu/x', 'ugc-eu'],
    ['/tiktok-ugc-2', 'root'],
    ['/', 'root'],
    ['/anything', 'root'],
  ])('%j -> %j', (path, v) => {
    expect(matchRoute(routes, path).v).toBe(v);
  });

  it('returns null when no prefix matches and there is no "/" route', () => {
    expect(matchRoute([{ prefix: '/a' }], '/b')).toBeNull();
    expect(matchRoute([], '/')).toBeNull();
  });

  it('does not depend on input order', () => {
    expect(matchRoute([...routes].reverse(), '/tiktok-ugc/eu').v).toBe('ugc-eu');
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

Run: `npm install && npm test -w @ikf/route-match`
Expected: FAIL với `Failed to load url ../src/index.js`.

- [ ] **Step 4: Implement**

`packages/route-match/src/index.js`:

```js
const PREFIX_RE = /^\/(?:[a-z0-9][a-z0-9._~-]*(?:\/[a-z0-9][a-z0-9._~-]*)*)?$/;

export function normalizePath(raw) {
  let p = String(raw ?? '');
  try {
    p = decodeURIComponent(p);
  } catch {
    // Malformed %-escape: match on the raw text rather than failing the request.
  }
  p = p.toLowerCase().replace(/\/{2,}/g, '/');
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

export function isValidPrefix(prefix) {
  return typeof prefix === 'string' && normalizePath(prefix) === prefix && PREFIX_RE.test(prefix);
}

export function sortRoutes(routes) {
  return [...routes].sort((a, b) => b.prefix.length - a.prefix.length || (a.prefix < b.prefix ? -1 : 1));
}

// Longest prefix wins; a prefix only matches on a segment boundary, so /v1 never matches /v10.
export function matchRoute(routes, rawPath) {
  const path = normalizePath(rawPath);
  let best = null;
  for (const r of routes) {
    const hit = r.prefix === '/' || path === r.prefix || path.startsWith(`${r.prefix}/`);
    if (hit && (!best || r.prefix.length > best.prefix.length)) best = r;
  }
  return best;
}
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/route-match`
Expected: tất cả PASS (35 test).

- [ ] **Step 6: Đưa `core-api` vào workspace**

```bash
rm services/core-api/package-lock.json services/core-api/.dockerignore
npm pkg set -w @ikf/core-api 'dependencies.@ikf/route-match=*'
npm install
npm test -w @ikf/core-api
```
Expected: `4 passed` (test health của plan infra vẫn xanh).

`.dockerignore` (gốc repo):

```
**/node_modules
**/test
.git
.github
infra
loadtest
workers
packages/cli
```

`services/core-api/Dockerfile` (thay toàn bộ):

```dockerfile
# Build context is the repo root: docker build -f services/core-api/Dockerfile .
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY packages/route-match/package.json packages/route-match/
COPY services/core-api/package.json services/core-api/
RUN npm ci --omit=dev -w @ikf/core-api
COPY packages/route-match/src packages/route-match/src
COPY services/core-api/src services/core-api/src
COPY services/core-api/migrations services/core-api/migrations
WORKDIR /app/services/core-api
USER node
EXPOSE 8080
CMD ["node", "src/server.js"]
```

Thư mục `migrations` có từ Task 2. Để build được ngay ở bước này, tạo trước thư mục rỗng: `mkdir -p services/core-api/migrations && touch services/core-api/migrations/.keep`.

- [ ] **Step 7: Sửa CI `core-api.yml`**

Trong job `test`: bỏ `defaults.run.working-directory`, đổi `cache-dependency-path` thành `package-lock.json`, và thay hai lệnh cuối:

```yaml
      - run: npm ci
      - run: npm test -w @ikf/route-match -w @ikf/core-api
```

Thêm vào `on.push.paths` và `on.pull_request.paths`: `"packages/route-match/**"`, `"package-lock.json"`.

Trong job `deploy`, bước `docker/build-push-action@v6`:

```yaml
        with:
          context: .
          file: services/core-api/Dockerfile
          platforms: linux/arm64
          push: true
          tags: ${{ vars.ECR_REPOSITORY_URL }}:${{ github.sha }}
```

Nếu Task 14 của plan infra chưa chạy, sửa luôn lệnh push image `bootstrap` ở đó thành `docker buildx build --platform linux/arm64 -f services/core-api/Dockerfile -t "$REPO:bootstrap" --push ../../..`.

- [ ] **Step 8: Build thử image và lint workflow**

Run:
```bash
docker buildx build --platform linux/arm64 -f services/core-api/Dockerfile -t ikf-core-api:local .
docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest
```
Expected: build thành công; actionlint không báo lỗi.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json .dockerignore packages/route-match services/core-api .github/workflows/core-api.yml
git commit -m "feat(route-match): shared path-prefix matcher; npm workspaces for core-api"
```

---

### Task 2: Migration Postgres cho publisher

**Files:**
- Create: `services/core-api/migrations/001_publisher.sql` (xóa `.keep`)
- Create: `services/core-api/src/db/migrate.js`
- Create: `services/core-api/vitest.config.js`
- Create: `services/core-api/test/helpers/db.js`
- Test: `services/core-api/test/migrate.test.js`

**Interfaces:**
- Produces:
  - `migrate(pool: pg.Pool, dir?: string): Promise<string[]>`: chạy các file `.sql` chưa chạy theo thứ tự tên, mỗi file một transaction, khóa bằng `pg_advisory_lock(727001)` để nhiều task ECS khởi động cùng lúc không chạy trùng. Trả về danh sách file vừa chạy.
  - `startDb({ migrate = true }?): Promise<{ pool, stop }>` (test helper, Postgres 17 qua Testcontainers).
  - `resetDb(pool): Promise<void>` (test helper, xóa sạch dữ liệu).
  - Bảng: `funnels`, `versions`, `domains`, `routes`, `route_events`, `host_revs`, `api_tokens`, `schema_migrations`.

- [ ] **Step 1: Cài dependency test**

```bash
npm install -D -w @ikf/core-api @testcontainers/postgresql@^11
```

`services/core-api/vitest.config.js`:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Postgres in Testcontainers: first pull and start can take a while.
    testTimeout: 30_000,
    hookTimeout: 120_000,
    fileParallelism: false,
  },
});
```

`services/core-api/test/helpers/db.js`:

```js
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import pg from 'pg';
import { migrate as runMigrations } from '../../src/db/migrate.js';

export async function startDb({ migrate = true } = {}) {
  const container = await new PostgreSqlContainer('postgres:17-alpine').start();
  const pool = new pg.Pool({ connectionString: container.getConnectionUri(), max: 10 });
  if (migrate) await runMigrations(pool);
  return {
    pool,
    stop: async () => {
      await pool.end();
      await container.stop();
    },
  };
}

export async function resetDb(pool) {
  await pool.query(
    'TRUNCATE route_events, routes, host_revs, versions, funnels, domains, api_tokens RESTART IDENTITY CASCADE',
  );
}
```

- [ ] **Step 2: Viết test fail**

`services/core-api/test/migrate.test.js`:

```js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startDb } from './helpers/db.js';
import { migrate } from '../src/db/migrate.js';

describe('migrate', () => {
  let db;
  beforeAll(async () => {
    db = await startDb({ migrate: false });
  });
  afterAll(() => db.stop());

  it('applies the publisher schema once and is idempotent', async () => {
    expect(await migrate(db.pool)).toEqual(['001_publisher.sql']);
    expect(await migrate(db.pool)).toEqual([]);
    const { rows } = await db.pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1",
    );
    expect(rows.map((r) => r.table_name)).toEqual([
      'api_tokens', 'domains', 'funnels', 'host_revs', 'route_events', 'routes', 'schema_migrations', 'versions',
    ]);
  });

  it('rejects slugs that are not url-safe', async () => {
    await expect(
      db.pool.query("INSERT INTO funnels (slug, created_by) VALUES ('Bad Slug', 't')"),
    ).rejects.toThrow(/funnels_slug_check/);
  });

  it('rejects unknown domain statuses', async () => {
    await expect(
      db.pool.query("INSERT INTO domains (host, status) VALUES ('x.test', 'paused')"),
    ).rejects.toThrow(/domains_status_check/);
  });

  it('runs concurrent migrators without applying anything twice', async () => {
    const results = await Promise.all([migrate(db.pool), migrate(db.pool), migrate(db.pool)]);
    expect(results.flat()).toEqual([]);
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/core-api -- test/migrate.test.js`
Expected: FAIL với `Failed to load url ../src/db/migrate.js`.

- [ ] **Step 4: Implement**

`services/core-api/migrations/001_publisher.sql`:

```sql
CREATE TABLE funnels (
  id         BIGSERIAL PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE CONSTRAINT funnels_slug_check CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  app        TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE versions (
  id          BIGSERIAL PRIMARY KEY,
  funnel_id   BIGINT NOT NULL REFERENCES funnels (id),
  n           INT NOT NULL CHECK (n > 0),
  sha256      TEXT NOT NULL,
  r2_key      TEXT NOT NULL UNIQUE,
  size        INT NOT NULL,
  lint_report JSONB NOT NULL DEFAULT '{}',
  created_by  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (funnel_id, n)
);

CREATE TABLE domains (
  host   TEXT PRIMARY KEY,
  status TEXT NOT NULL CONSTRAINT domains_status_check CHECK (status IN ('active', 'disabled'))
);

CREATE TABLE routes (
  host        TEXT NOT NULL REFERENCES domains (host),
  path_prefix TEXT NOT NULL,
  version_id  BIGINT NOT NULL REFERENCES versions (id),
  updated_by  TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (host, path_prefix)
);

CREATE TABLE route_events (
  id           BIGSERIAL PRIMARY KEY,
  host         TEXT NOT NULL,
  path_prefix  TEXT NOT NULL,
  from_version BIGINT REFERENCES versions (id),
  to_version   BIGINT REFERENCES versions (id),
  actor        TEXT NOT NULL,
  at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX route_events_by_route ON route_events (host, path_prefix, id DESC);

CREATE TABLE host_revs (
  host          TEXT PRIMARY KEY REFERENCES domains (host),
  rev           BIGINT NOT NULL DEFAULT 0,
  kv_synced_rev BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE api_tokens (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  token_sha256 TEXT NOT NULL UNIQUE,
  roles        TEXT[] NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at   TIMESTAMPTZ
);
```

`services/core-api/src/db/migrate.js`:

```js
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const MIGRATIONS_DIR = new URL('../../migrations/', import.meta.url).pathname;
const LOCK_ID = 727001;

export async function migrate(pool, dir = MIGRATIONS_DIR) {
  const client = await pool.connect();
  try {
    // Several ECS tasks boot together; only one may migrate at a time.
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_ID]);
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())',
    );
    const done = new Set((await client.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name));
    const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
    const applied = [];
    for (const file of files) {
      if (done.has(file)) continue;
      const sql = await readFile(join(dir, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`migration ${file} failed: ${err.message}`, { cause: err });
      }
      applied.push(file);
    }
    return applied;
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]).catch(() => {});
    client.release();
  }
}
```

```bash
rm services/core-api/migrations/.keep
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/core-api -- test/migrate.test.js`
Expected: `4 passed`.

- [ ] **Step 6: Commit**

```bash
git add services/core-api package-lock.json
git commit -m "feat(core-api): publisher schema migration with advisory-locked runner"
```

---

### Task 3: Lỗi HTTP, token API và phân quyền

**Files:**
- Create: `services/core-api/src/errors.js`, `services/core-api/src/auth.js`, `services/core-api/src/http/tokens.js`
- Modify: `services/core-api/src/app.js` (thay toàn bộ)
- Test: `services/core-api/test/auth.test.js`

**Interfaces:**
- Consumes: `startDb`, `resetDb` (Task 2).
- Produces:
  - `class HttpError(status: number, code: string, detail?: any)`. Error handler trả `{"error": code, "detail": detail}` với `status`.
  - `ROLES = ['publisher', 'router', 'admin']`. `admin` có mọi quyền.
  - `createToken(pool, { name, roles }): Promise<string>` → `ikf_<43 ký tự base64url>`, chỉ lưu sha256.
  - `ensureToken(pool, { name, roles, token }): Promise<void>` (idempotent, dùng cho token bootstrap).
  - `requireRole(pool, role: string | string[])`: hook `onRequest` của Fastify. `401 unauthorized` khi thiếu, sai hoặc token đã thu hồi. `403 forbidden` khi thiếu quyền. Gán `req.actor = <tên token>`.
  - `buildApp({ checks, timeoutMs, logger, deps })`: `deps = { pool, store, kv, mediaOrigins, previewBaseUrl, log }`. Có `deps.pool` thì đăng ký `POST /v1/tokens`.
  - `POST /v1/tokens` (admin) body `{name, roles}` → `201 {name, roles, token}`; role lạ → `400 invalid_roles`.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/auth.test.js`:

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { buildApp } from '../src/app.js';
import { createToken, ensureToken } from '../src/auth.js';

describe('API tokens', () => {
  let db;
  let app;
  let admin;

  beforeAll(async () => {
    db = await startDb();
    app = buildApp({ deps: { pool: db.pool } });
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
    await db.stop();
  });
  beforeEach(async () => {
    await resetDb(db.pool);
    admin = await createToken(db.pool, { name: 'admin', roles: ['admin'] });
  });

  const post = (token, payload) =>
    app.inject({
      method: 'POST',
      url: '/v1/tokens',
      headers: token ? { authorization: `Bearer ${token}` } : {},
      payload,
    });

  it('401 without a token, before looking at the body', async () => {
    const res = await post(null, { nonsense: true });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ error: 'unauthorized' });
  });

  it('401 for an unknown token', async () => {
    expect((await post('ikf_nope', { name: 'x', roles: ['router'] })).statusCode).toBe(401);
  });

  it('401 for a revoked token', async () => {
    await db.pool.query("UPDATE api_tokens SET revoked_at = now() WHERE name = 'admin'");
    expect((await post(admin, { name: 'x', roles: ['router'] })).statusCode).toBe(401);
  });

  it('admin issues a token that is stored only as a hash', async () => {
    const res = await post(admin, { name: 'thinh', roles: ['publisher', 'router'] });
    expect(res.statusCode).toBe(201);
    const { token, name, roles } = res.json();
    expect(token).toMatch(/^ikf_[A-Za-z0-9_-]{43}$/);
    expect({ name, roles }).toEqual({ name: 'thinh', roles: ['publisher', 'router'] });
    const { rows } = await db.pool.query("SELECT token_sha256 FROM api_tokens WHERE name = 'thinh'");
    expect(rows[0].token_sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(rows[0].token_sha256).not.toContain(token);
  });

  it('403 when the token lacks the role', async () => {
    const publisher = await createToken(db.pool, { name: 'p', roles: ['publisher'] });
    const res = await post(publisher, { name: 'x', roles: ['router'] });
    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({ error: 'forbidden' });
  });

  it('400 for unknown roles', async () => {
    const res = await post(admin, { name: 'x', roles: ['owner'] });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('invalid_roles');
  });

  it('ensureToken is idempotent', async () => {
    await ensureToken(db.pool, { name: 'bootstrap', roles: ['admin'], token: 'ikf_bootstrap' });
    await ensureToken(db.pool, { name: 'bootstrap', roles: ['admin'], token: 'ikf_bootstrap' });
    const { rows } = await db.pool.query("SELECT count(*)::int AS n FROM api_tokens WHERE name = 'bootstrap'");
    expect(rows[0].n).toBe(1);
    expect((await post('ikf_bootstrap', { name: 'x', roles: ['router'] })).statusCode).toBe(201);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/core-api -- test/auth.test.js`
Expected: FAIL với `Failed to load url ../src/auth.js`.

- [ ] **Step 3: Implement**

`services/core-api/src/errors.js`:

```js
export class HttpError extends Error {
  constructor(status, code, detail) {
    super(code);
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}
```

`services/core-api/src/auth.js`:

```js
import { createHash, randomBytes } from 'node:crypto';

export const ROLES = ['publisher', 'router', 'admin'];

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

export async function createToken(pool, { name, roles }) {
  const token = `ikf_${randomBytes(32).toString('base64url')}`;
  await pool.query('INSERT INTO api_tokens (name, token_sha256, roles) VALUES ($1, $2, $3)', [name, sha256(token), roles]);
  return token;
}

export async function ensureToken(pool, { name, roles, token }) {
  await pool.query(
    'INSERT INTO api_tokens (name, token_sha256, roles) VALUES ($1, $2, $3) ON CONFLICT (token_sha256) DO NOTHING',
    [name, sha256(token), roles],
  );
}

export function requireRole(pool, role) {
  const wanted = Array.isArray(role) ? role : [role];
  return async (req, reply) => {
    const m = /^Bearer (\S+)$/.exec(req.headers.authorization ?? '');
    const { rows } = m
      ? await pool.query('SELECT name, roles FROM api_tokens WHERE token_sha256 = $1 AND revoked_at IS NULL', [sha256(m[1])])
      : { rows: [] };
    if (!rows.length) return reply.code(401).send({ error: 'unauthorized' });
    const { name, roles } = rows[0];
    if (!roles.includes('admin') && !wanted.some((r) => roles.includes(r))) {
      return reply.code(403).send({ error: 'forbidden' });
    }
    req.actor = name;
  };
}
```

`services/core-api/src/http/tokens.js`:

```js
import { ROLES, createToken, requireRole } from '../auth.js';
import { HttpError } from '../errors.js';

export default async function tokensHttp(app, { pool }) {
  app.post(
    '/v1/tokens',
    {
      onRequest: requireRole(pool, 'admin'),
      schema: {
        body: {
          type: 'object',
          required: ['name', 'roles'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 64 },
            roles: { type: 'array', minItems: 1, items: { type: 'string' } },
          },
        },
      },
    },
    async (req, reply) => {
      const { name, roles } = req.body;
      if (!roles.every((r) => ROLES.includes(r))) throw new HttpError(400, 'invalid_roles', { allowed: ROLES });
      const token = await createToken(pool, { name, roles });
      reply.code(201);
      return { name, roles, token };
    },
  );
}
```

`services/core-api/src/app.js` (thay toàn bộ; giữ nguyên hành vi `/livez`, `/healthz` của plan infra):

```js
import Fastify from 'fastify';
import { HttpError } from './errors.js';
import tokensHttp from './http/tokens.js';

export function buildApp({ checks = {}, timeoutMs = 1000, logger = false, deps } = {}) {
  const app = Fastify({ logger });
  app.decorateRequest('actor', null);

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof HttpError) {
      return reply.code(err.status).send({ error: err.code, ...(err.detail !== undefined && { detail: err.detail }) });
    }
    if (err.validation) return reply.code(400).send({ error: 'bad_request', detail: err.message });
    if (err.code === 'FST_ERR_CTP_BODY_TOO_LARGE') return reply.code(413).send({ error: 'bundle_too_large' });
    req.log.error(err);
    return reply.code(500).send({ error: 'internal' });
  });

  // ALB target health: must not depend on DB/cache, or a DB blip drains every task.
  app.get('/livez', async () => ({ status: 'ok' }));

  app.get('/healthz', async (req, reply) => {
    const names = Object.keys(checks);
    const outcomes = await Promise.allSettled(names.map((name) => withTimeout(checks[name](), timeoutMs)));
    const results = {};
    names.forEach((name, i) => {
      results[name] = outcomes[i].status === 'fulfilled' ? 'ok' : 'fail';
    });
    const healthy = Object.values(results).every((r) => r === 'ok');
    reply.code(healthy ? 200 : 503);
    return { status: healthy ? 'ok' : 'degraded', checks: results };
  });

  if (deps?.pool) app.register(tokensHttp, deps);

  return app;
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/core-api`
Expected: toàn bộ PASS (`app.test.js` 4, `migrate.test.js` 4, `auth.test.js` 7).

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(core-api): hashed API tokens with publisher/router/admin roles"
```

---

### Task 4: Validator bundle

**Files:**
- Create: `services/core-api/src/publisher/validate.js`
- Create: `services/core-api/scripts/validate-all.js`
- Test: `services/core-api/test/validate.test.js`

**Interfaces:**
- Produces:
  - `MAX_BUNDLE_BYTES = 1048576`
  - `validateBundle(html: string, { slug, mediaOrigins: string[], maxBytes? }): { ok: true, size } | { ok: false, status: 413 | 422, errors: {code, detail}[] }`
  - Mã lỗi: `bundle_too_large` (`detail: {size, max}`, status 413), `media_origin_not_allowed` (`detail: {urls}`), `script_origin_not_allowed` (`detail: {urls}`), `slug_mismatch` (`detail: {expected, found}`).
  - `node services/core-api/scripts/validate-all.js <thư-mục> --media-origin <url> [--media-origin <url>]`: in lỗi của từng `demo.html`, exit 1 nếu có file lỗi.

**Media được kiểm tra:** `src`/`poster`/`srcset` trên mọi thẻ trừ `<script>`, `href` của `<link>`, `url()` trong `<style>` và thuộc tính `style`, mọi giá trị trong map `/*IMG-START*/{...}/*IMG-END*/`, và mọi chuỗi tĩnh `'img/<tên>.<đuôi ảnh/video>'` không phải key của map. Không kiểm tra `<a href>` và HTML nằm trong chuỗi JS.

- [ ] **Step 1: Cài dependency**

```bash
npm install -w @ikf/core-api htmlparser2@^10
```

- [ ] **Step 2: Viết test fail**

`services/core-api/test/validate.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { validateBundle, MAX_BUNDLE_BYTES } from '../src/publisher/validate.js';

const MEDIA = 'https://media.test/funnels/';
const opts = { slug: 'aivideo', mediaOrigins: [MEDIA] };

const page = ({
  head = '',
  body = '',
  config = "const CONFIG={funnel:'aivideo',plans:{}};",
  img = '{}',
  js = '',
} = {}) =>
  `<!doctype html><html><head>${head}</head><body>${body}<script>${config}const IMG=/*IMG-START*/${img}/*IMG-END*/;${js}</script></body></html>`;

const codes = (r) => r.errors.map((e) => e.code);
const urlsOf = (r, code) => r.errors.find((e) => e.code === code)?.detail.urls;

describe('validateBundle', () => {
  it('accepts a funnel that only uses allowed media', () => {
    const html = page({
      head: [
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter&display=swap">',
        '<style>.a{background:url("data:image/svg+xml,%3Csvg%3E%3C/svg%3E")} .b{fill:url(#cgrad)}</style>',
      ].join(''),
      body: `<img src="${MEDIA}hero.jpg"><a href="https://elsewhere.test/terms">Terms</a><div style="background:url('${MEDIA}bg.webp')"></div>`,
      img: `{'img/hero.jpg':'${MEDIA}hero.jpg','img/next.jpg':'data:image/jpeg;base64,AAAA'}`,
      js: "document.body.innerHTML+=`<img src=\"${im('img/hero.jpg')}\">`;const pick=n=>im('img/'+n+'.jpg');",
    });
    expect(validateBundle(html, opts)).toEqual({ ok: true, size: Buffer.byteLength(html) });
  });

  it('rejects bundles over 1MB with 413', () => {
    const html = page({ body: 'x'.repeat(MAX_BUNDLE_BYTES) });
    const r = validateBundle(html, opts);
    expect(r.status).toBe(413);
    expect(r.errors).toEqual([{ code: 'bundle_too_large', detail: { size: Buffer.byteLength(html), max: MAX_BUNDLE_BYTES } }]);
  });

  it('counts UTF-8 bytes, not characters', () => {
    const html = page({ body: 'é'.repeat(MAX_BUNDLE_BYTES / 2) });
    expect(validateBundle(html, opts).status).toBe(413);
  });

  it.each([
    ['relative img', '<img src="img/a.jpg">', 'img/a.jpg'],
    ['other origin', '<img src="https://evil.test/a.jpg">', 'https://evil.test/a.jpg'],
    ['outside the media path', '<img src="https://media.test/other/a.jpg">', 'https://media.test/other/a.jpg'],
    ['look-alike host', '<img src="https://media.test.evil/funnels/a.jpg">', 'https://media.test.evil/funnels/a.jpg'],
    ['protocol-relative', '<img src="//media.test/funnels/a.jpg">', '//media.test/funnels/a.jpg'],
    ['video poster', '<video poster="img/p.jpg"></video>', 'img/p.jpg'],
    ['video source', '<video><source src="https://cdn.test/v.mp4"></video>', 'https://cdn.test/v.mp4'],
    ['srcset', `<img src="${MEDIA}a.jpg" srcset="${MEDIA}a.jpg 1x, img/a@2x.jpg 2x">`, 'img/a@2x.jpg'],
    ['style attribute', '<div style="background:url(img/bg.jpg)"></div>', 'img/bg.jpg'],
  ])('rejects %s', (_name, body, bad) => {
    const r = validateBundle(page({ body }), opts);
    expect(r.status).toBe(422);
    expect(urlsOf(r, 'media_origin_not_allowed')).toEqual([bad]);
  });

  it('rejects url() in <style> outside the allowlist', () => {
    const r = validateBundle(page({ head: '<style>.h{background-image:url("img/hook.jpg")}</style>' }), opts);
    expect(urlsOf(r, 'media_origin_not_allowed')).toEqual(['img/hook.jpg']);
  });

  it('rejects stylesheet links outside the allowlist', () => {
    const r = validateBundle(page({ head: '<link rel="stylesheet" href="https://cdn.test/x.css">' }), opts);
    expect(urlsOf(r, 'media_origin_not_allowed')).toEqual(['https://cdn.test/x.css']);
  });

  it('rejects IMG map values that are still relative', () => {
    const r = validateBundle(page({ img: "{'img/hero.jpg':'img/hero.jpg'}" }), opts);
    expect(urlsOf(r, 'media_origin_not_allowed')).toEqual(['img/hero.jpg']);
  });

  it('rejects static img/ literals that the IMG map does not resolve', () => {
    const r = validateBundle(
      page({ img: `{'img/hero.jpg':'${MEDIA}hero.jpg'}`, js: "x(im('img/hero.jpg'));y(im('img/next.webp'));" }),
      opts,
    );
    expect(urlsOf(r, 'media_origin_not_allowed')).toEqual(['img/next.webp']);
  });

  it('rejects any external <script src>', () => {
    const r = validateBundle(page({ head: '<script src="https://cdn.test/lib.js"></script>' }), opts);
    expect(r.status).toBe(422);
    expect(urlsOf(r, 'script_origin_not_allowed')).toEqual(['https://cdn.test/lib.js']);
  });

  it('rejects a CONFIG.funnel that differs from the slug', () => {
    const r = validateBundle(page({ config: "const CONFIG={funnel:'other'};" }), opts);
    expect(r.errors).toEqual([{ code: 'slug_mismatch', detail: { expected: 'aivideo', found: 'other' } }]);
  });

  it('rejects a bundle with no CONFIG.funnel', () => {
    const r = validateBundle(page({ config: 'const CONFIG={plans:{}};' }), opts);
    expect(r.errors).toEqual([{ code: 'slug_mismatch', detail: { expected: 'aivideo', found: null } }]);
  });

  it('reports every problem at once, each url once', () => {
    const r = validateBundle(
      page({
        head: '<script src="https://cdn.test/a.js"></script>',
        body: '<img src="img/a.jpg"><img src="img/a.jpg">',
        config: "const CONFIG={funnel:'x'};",
      }),
      opts,
    );
    expect(codes(r).sort()).toEqual(['media_origin_not_allowed', 'script_origin_not_allowed', 'slug_mismatch']);
    expect(urlsOf(r, 'media_origin_not_allowed')).toEqual(['img/a.jpg']);
  });

  it('treats a media origin without a trailing slash as a directory', () => {
    const r = validateBundle(page({ body: '<img src="https://media.test/funnelsX/a.jpg">' }), {
      slug: 'aivideo',
      mediaOrigins: ['https://media.test/funnels'],
    });
    expect(urlsOf(r, 'media_origin_not_allowed')).toEqual(['https://media.test/funnelsX/a.jpg']);
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/core-api -- test/validate.test.js`
Expected: FAIL với `Failed to load url ../src/publisher/validate.js`.

- [ ] **Step 4: Implement**

`services/core-api/src/publisher/validate.js`:

```js
import { Parser } from 'htmlparser2';

export const MAX_BUNDLE_BYTES = 1024 * 1024;

const ASSET_ALLOWLIST = ['https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'];
const SCRIPT_ALLOWLIST = [];

const IMG_BLOCK = /\/\*IMG-START\*\/([\s\S]*?)\/\*IMG-END\*\//;
const IMG_ENTRY = /(['"])([^'"]+)\1\s*:\s*(['"])([^'"]*)\3/g;
const IMG_LITERAL = /['"`](img\/[\w./@-]+\.(?:jpe?g|png|webp|gif|svg|avif|mp4|webm))['"`]/gi;
const CSS_URL = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
const CONFIG_FUNNEL = /CONFIG\s*=\s*\{[\s\S]*?\bfunnel\s*:\s*(['"])([^'"]+)\1/;

const asDirectory = (prefix) => {
  const href = new URL(prefix).href;
  return href.endsWith('/') ? href : `${href}/`;
};

const absoluteHref = (url) => {
  try {
    return new URL(url).href;
  } catch {
    return null; // relative or protocol-relative: never allowed
  }
};

const underAny = (url, prefixes) => {
  const href = absoluteHref(url);
  return href !== null && prefixes.some((p) => href.startsWith(p));
};

export function validateBundle(html, { slug, mediaOrigins, maxBytes = MAX_BUNDLE_BYTES }) {
  const size = Buffer.byteLength(html, 'utf8');
  if (size > maxBytes) {
    return { ok: false, status: 413, errors: [{ code: 'bundle_too_large', detail: { size, max: maxBytes } }] };
  }

  const mediaPrefixes = [...mediaOrigins.map(asDirectory), ...ASSET_ALLOWLIST];
  const media = new Set();
  const scripts = new Set();
  const css = [];
  let inStyle = false;

  const parser = new Parser(
    {
      onopentag(name, attrs) {
        if (name === 'script') {
          if (attrs.src !== undefined) scripts.add(attrs.src);
          return;
        }
        if (name === 'style') inStyle = true;
        if (attrs.src) media.add(attrs.src);
        if (attrs.poster) media.add(attrs.poster);
        if (attrs.srcset) {
          for (const part of attrs.srcset.split(',')) {
            const url = part.trim().split(/\s+/)[0];
            if (url) media.add(url);
          }
        }
        if (name === 'link' && attrs.href) media.add(attrs.href);
        if (attrs.style) css.push(attrs.style);
      },
      ontext(text) {
        if (inStyle) css.push(text);
      },
      onclosetag(name) {
        if (name === 'style') inStyle = false;
      },
    },
    { decodeEntities: true },
  );
  parser.write(html);
  parser.end();

  for (const block of css) for (const m of block.matchAll(CSS_URL)) media.add(m[2].trim());

  // Funnels resolve images through the IMG map (im('img/x.jpg')), so the keys stay relative
  // on purpose; the values are what the browser loads.
  const mapped = new Set();
  for (const m of (IMG_BLOCK.exec(html)?.[1] ?? '').matchAll(IMG_ENTRY)) {
    mapped.add(m[2]);
    if (m[4]) media.add(m[4]);
  }
  for (const m of html.matchAll(IMG_LITERAL)) if (!mapped.has(m[1])) media.add(m[1]);

  const errors = [];
  const badMedia = [...media].filter((u) => !u.startsWith('data:') && !u.startsWith('#') && !underAny(u, mediaPrefixes));
  if (badMedia.length) errors.push({ code: 'media_origin_not_allowed', detail: { urls: badMedia } });

  const badScripts = [...scripts].filter((u) => !underAny(u, SCRIPT_ALLOWLIST));
  if (badScripts.length) errors.push({ code: 'script_origin_not_allowed', detail: { urls: badScripts } });

  const found = CONFIG_FUNNEL.exec(html)?.[2] ?? null;
  if (found !== slug) errors.push({ code: 'slug_mismatch', detail: { expected: slug, found } });

  return errors.length ? { ok: false, status: 422, errors } : { ok: true, size };
}
```

`services/core-api/scripts/validate-all.js`:

```js
#!/usr/bin/env node
// Usage: node scripts/validate-all.js <funnel-dev-dir> --media-origin <url> [--media-origin <url>...]
// Runs the publish validator on every demo.html below <dir>; the slug is taken from CONFIG.funnel
// (or the folder name when CONFIG.funnel is missing, which then reports slug_mismatch).
import { readFile, readdir } from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';
import { parseArgs } from 'node:util';
import { validateBundle } from '../src/publisher/validate.js';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { 'media-origin': { type: 'string', multiple: true } },
});
const root = positionals[0];
const mediaOrigins = values['media-origin'] ?? [];
if (!root || !mediaOrigins.length) {
  console.error('usage: validate-all.js <dir> --media-origin <url>');
  process.exit(2);
}

const files = (await readdir(root, { recursive: true })).filter((f) => basename(f) === 'demo.html').sort();
let failed = 0;
for (const file of files) {
  const html = await readFile(join(root, file), 'utf8');
  const slug = /CONFIG\s*=\s*\{[\s\S]*?\bfunnel\s*:\s*['"]([^'"]+)['"]/.exec(html)?.[1] ?? basename(dirname(join(root, file)));
  const r = validateBundle(html, { slug, mediaOrigins });
  if (r.ok) continue;
  failed += 1;
  console.log(`✗ ${relative(root, join(root, file))}`);
  for (const e of r.errors) console.log(`    ${e.code} ${JSON.stringify(e.detail)}`);
}
console.log(`${files.length - failed}/${files.length} demo.html pass`);
process.exit(failed ? 1 : 0);
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/core-api -- test/validate.test.js`
Expected: toàn bộ PASS.

- [ ] **Step 6: Chạy thử trên funnel thật (chưa đổi link media, nên phải fail đúng kiểu)**

Run: `node services/core-api/scripts/validate-all.js /Users/daothinh/ikame/funnel/funnel-development --media-origin https://media.test/ | tail -5`
Expected: exit 1. Các lỗi chỉ thuộc `media_origin_not_allowed` (ảnh `img/...` chưa đổi sang URL thật) và `slug_mismatch` cho 9 funnel thiếu `CONFIG.funnel`. **Không** có `script_origin_not_allowed` và không có lỗi nào trỏ vào font Google hoặc `url(#...)`. Nếu thấy lỗi khác, sửa validator trước khi commit.

- [ ] **Step 7: Commit**

```bash
git add services/core-api package-lock.json
git commit -m "feat(publisher): bundle validator for size, media/script origins and slug"
```

---

### Task 5: Adapter R2 và KV

**Files:**
- Create: `services/core-api/src/publisher/bundle-store.js`, `services/core-api/src/publisher/route-kv.js`
- Create: `services/core-api/test/helpers/fakes.js`
- Test: `services/core-api/test/adapters.test.js`

**Interfaces:**
- Produces:
  - `class StoreUnavailableError`; `createR2Store({ accountId, bucket, accessKeyId, secretAccessKey, client? })` → `{ put(key, body, { sha256 }): Promise<void> }`. Ghi với `ContentType: text/html; charset=utf-8` và metadata `sha256`. Mọi lỗi được bọc thành `StoreUnavailableError`.
  - `class KvUnavailableError`; `createKvClient({ accountId, namespaceId, apiToken, fetch? })` → `{ put(key, value: string): Promise<void> }` qua Cloudflare REST API. Lỗi mạng, HTTP không 2xx, hoặc `success: false` → `KvUnavailableError`.
  - `routeKey(host) = 'route:' + host`
  - Test fakes: `fakeStore()` → `{ objects: Map<key,{body, sha256}>, fail(on = true), put }`; `fakeKv()` → `{ values: Map<key,string>, fail(on = true), put, doc(host) }` (`doc` parse JSON của `route:<host>`).

- [ ] **Step 1: Cài dependency**

```bash
npm install -w @ikf/core-api @aws-sdk/client-s3@^3
```

- [ ] **Step 2: Viết test fail**

`services/core-api/test/adapters.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { createR2Store, StoreUnavailableError } from '../src/publisher/bundle-store.js';
import { createKvClient, KvUnavailableError, routeKey } from '../src/publisher/route-kv.js';

describe('R2 bundle store', () => {
  it('puts html with content type and sha256 metadata', async () => {
    const sent = [];
    const store = createR2Store({ bucket: 'ikf-bundles-staging', client: { send: async (cmd) => sent.push(cmd.input) } });
    await store.put('bundles/aivideo/v1/index.html', '<html></html>', { sha256: 'abc' });
    expect(sent).toEqual([
      {
        Bucket: 'ikf-bundles-staging',
        Key: 'bundles/aivideo/v1/index.html',
        Body: '<html></html>',
        ContentType: 'text/html; charset=utf-8',
        Metadata: { sha256: 'abc' },
      },
    ]);
  });

  it('wraps S3 errors as StoreUnavailableError', async () => {
    const store = createR2Store({ bucket: 'b', client: { send: async () => { throw new Error('503 SlowDown'); } } });
    await expect(store.put('k', 'x', { sha256: 's' })).rejects.toBeInstanceOf(StoreUnavailableError);
  });
});

describe('KV client', () => {
  const make = (impl) => {
    const calls = [];
    const kv = createKvClient({
      accountId: 'acc',
      namespaceId: 'ns',
      apiToken: 'tok',
      fetch: async (url, init) => {
        calls.push({ url, init });
        return impl();
      },
    });
    return { kv, calls };
  };

  it('PUTs the value to the namespace with a bearer token', async () => {
    const { kv, calls } = make(() => new Response(JSON.stringify({ success: true }), { status: 200 }));
    await kv.put(routeKey('try.x.com'), '{"rev":1}');
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(
      'https://api.cloudflare.com/client/v4/accounts/acc/storage/kv/namespaces/ns/values/route%3Atry.x.com',
    );
    expect(calls[0].init.method).toBe('PUT');
    expect(calls[0].init.headers.authorization).toBe('Bearer tok');
    expect(calls[0].init.body).toBe('{"rev":1}');
  });

  it.each([
    ['HTTP 500', () => new Response('oops', { status: 500 })],
    ['success false', () => new Response(JSON.stringify({ success: false, errors: [{ code: 10000 }] }), { status: 200 })],
    ['network error', () => { throw new TypeError('fetch failed'); }],
  ])('throws KvUnavailableError on %s', async (_name, impl) => {
    const { kv } = make(impl);
    await expect(kv.put('route:x', '{}')).rejects.toBeInstanceOf(KvUnavailableError);
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/core-api -- test/adapters.test.js`
Expected: FAIL với `Failed to load url ../src/publisher/bundle-store.js`.

- [ ] **Step 4: Implement**

`services/core-api/src/publisher/bundle-store.js`:

```js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class StoreUnavailableError extends Error {}

export function createR2Store({ accountId, bucket, accessKeyId, secretAccessKey, client }) {
  const s3 =
    client ??
    new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  return {
    async put(key, body, { sha256 }) {
      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: 'text/html; charset=utf-8',
            Metadata: { sha256 },
          }),
        );
      } catch (err) {
        throw new StoreUnavailableError(`r2 put ${key}: ${err.message}`, { cause: err });
      }
    },
  };
}
```

`services/core-api/src/publisher/route-kv.js`:

```js
export class KvUnavailableError extends Error {}

export const routeKey = (host) => `route:${host}`;

export function createKvClient({ accountId, namespaceId, apiToken, fetch: doFetch = fetch }) {
  const base = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/`;
  return {
    async put(key, value) {
      let res;
      try {
        res = await doFetch(base + encodeURIComponent(key), {
          method: 'PUT',
          headers: { authorization: `Bearer ${apiToken}`, 'content-type': 'text/plain' },
          body: value,
        });
      } catch (err) {
        throw new KvUnavailableError(`kv put ${key}: ${err.message}`, { cause: err });
      }
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) throw new KvUnavailableError(`kv put ${key}: HTTP ${res.status}`);
    },
  };
}
```

`services/core-api/test/helpers/fakes.js`:

```js
import { StoreUnavailableError } from '../../src/publisher/bundle-store.js';
import { KvUnavailableError, routeKey } from '../../src/publisher/route-kv.js';

export function fakeStore() {
  const objects = new Map();
  let failing = false;
  return {
    objects,
    fail(on = true) {
      failing = on;
    },
    async put(key, body, { sha256 }) {
      if (failing) throw new StoreUnavailableError('r2 down');
      objects.set(key, { body, sha256 });
    },
  };
}

export function fakeKv() {
  const values = new Map();
  let failing = false;
  return {
    values,
    fail(on = true) {
      failing = on;
    },
    async put(key, value) {
      if (failing) throw new KvUnavailableError('kv down');
      values.set(key, value);
    },
    doc(host) {
      const raw = values.get(routeKey(host));
      return raw === undefined ? undefined : JSON.parse(raw);
    },
  };
}
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/core-api -- test/adapters.test.js`
Expected: `6 passed`.

- [ ] **Step 6: Commit**

```bash
git add services/core-api package-lock.json
git commit -m "feat(publisher): R2 bundle store and Cloudflare KV client adapters"
```

---
### Task 6: Publish version (`POST /v1/funnels/:slug/versions`)

**Files:**
- Create: `services/core-api/src/publisher/publish.js`, `services/core-api/src/http/versions.js`
- Create: `services/core-api/test/helpers/app.js`, `services/core-api/test/helpers/pages.js`
- Modify: `services/core-api/src/app.js` (đăng ký plugin)
- Test: `services/core-api/test/publish.test.js`

**Interfaces:**
- Consumes: `validateBundle` (Task 4), `StoreUnavailableError` (Task 5), `requireRole`, `HttpError` (Task 3), `fakeStore`, `fakeKv` (Task 5).
- Produces:
  - `sha256Hex(s): string`, `bundleKey(slug, n) = 'bundles/<slug>/v<n>/index.html'`
  - `publishVersion({ pool, store, previewBaseUrl }, { slug, html, lintReport?, actor }): Promise<{ funnel, v, sha256, created: boolean, previewUrl }>`. Funnel chưa có thì tạo luôn. Nếu sha256 trùng **version mới nhất** thì trả version đó (`created: false`). R2 lỗi → `HttpError(503, 'r2_unavailable')`, không ghi row nào.
  - `POST /v1/funnels/:slug/versions` (role `publisher`), body `{ html, sha256, lint_report? }`, giới hạn body 3MB.
    - `201 { funnel, v, sha256, created: true, preview_url }`, hoặc `200` khi trùng.
    - `400 sha256_mismatch` / `400 bad_request`.
    - Validator fail: status 413/422, `error` = mã đầu tiên, `detail` = toàn bộ mảng lỗi.
  - Test helpers: `makeApp(pool) → { app, store, kv }`, `tokenFor(pool, ...roles)` (tên token = các role nối bằng `+`), `bearer(token)`, `sha(s)`, `PREVIEW`, `funnelHtml(slug, marker?)`.

- [ ] **Step 1: Viết test helper và test fail**

`services/core-api/test/helpers/pages.js`:

```js
export const funnelHtml = (slug, marker = '') =>
  `<!doctype html><html><head><title>${slug}</title></head><body><p>${marker}</p><script>const CONFIG={funnel:'${slug}'};</script></body></html>`;
```

`services/core-api/test/helpers/app.js`:

```js
import { createHash } from 'node:crypto';
import { buildApp } from '../../src/app.js';
import { createToken } from '../../src/auth.js';
import { fakeKv, fakeStore } from './fakes.js';

export const PREVIEW = 'https://preview.ikf-staging.example';

export async function makeApp(pool) {
  const store = fakeStore();
  const kv = fakeKv();
  const app = buildApp({ deps: { pool, store, kv, mediaOrigins: ['https://media.test/'], previewBaseUrl: PREVIEW } });
  await app.ready();
  return { app, store, kv };
}

export const tokenFor = (pool, ...roles) => createToken(pool, { name: roles.join('+'), roles });
export const bearer = (token) => ({ authorization: `Bearer ${token}` });
export const sha = (s) => createHash('sha256').update(s).digest('hex');
```

`services/core-api/test/publish.test.js`:

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, sha, PREVIEW } from './helpers/app.js';
import { funnelHtml } from './helpers/pages.js';

describe('POST /v1/funnels/:slug/versions', () => {
  let db;
  let app;
  let store;
  let publisher;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    ({ app, store } = await makeApp(db.pool));
    publisher = await tokenFor(db.pool, 'publisher');
  });
  afterEach(() => app.close());

  const publish = (slug, html, { token = publisher, hash = sha(html) } = {}) =>
    app.inject({
      method: 'POST',
      url: `/v1/funnels/${slug}/versions`,
      headers: bearer(token),
      payload: { html, sha256: hash, lint_report: { lint: 'pass', smoke: 'pass' } },
    });
  const count = async (table) => (await db.pool.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n;

  it('creates v1 with the bundle in R2 and a versions row', async () => {
    const html = funnelHtml('aivideo', 'one');
    const res = await publish('aivideo', html);
    expect(res.statusCode).toBe(201);
    expect(res.json()).toEqual({
      funnel: 'aivideo', v: 1, sha256: sha(html), created: true, preview_url: `${PREVIEW}/aivideo/v1`,
    });
    expect(store.objects.get('bundles/aivideo/v1/index.html')).toEqual({ body: html, sha256: sha(html) });
    const { rows } = await db.pool.query('SELECT n, r2_key, size, lint_report, created_by FROM versions');
    expect(rows).toEqual([
      {
        n: 1,
        r2_key: 'bundles/aivideo/v1/index.html',
        size: Buffer.byteLength(html),
        lint_report: { lint: 'pass', smoke: 'pass' },
        created_by: 'publisher',
      },
    ]);
  });

  it('returns the latest version when the same html is published again', async () => {
    const html = funnelHtml('aivideo', 'one');
    await publish('aivideo', html);
    const again = await publish('aivideo', html);
    expect(again.statusCode).toBe(200);
    expect(again.json()).toMatchObject({ v: 1, created: false });
    expect(store.objects.size).toBe(1);
    expect(await count('versions')).toBe(1);
  });

  it('only dedupes against the latest version', async () => {
    const a = funnelHtml('aivideo', 'a');
    const b = funnelHtml('aivideo', 'b');
    expect((await publish('aivideo', a)).json().v).toBe(1);
    expect((await publish('aivideo', b)).json().v).toBe(2);
    expect((await publish('aivideo', a)).json().v).toBe(3);
  });

  it('422 with every violation, and nothing stored', async () => {
    const html = funnelHtml('other', '<img src="img/a.jpg">');
    const res = await publish('aivideo', html);
    expect(res.statusCode).toBe(422);
    expect(res.json()).toEqual({
      error: 'media_origin_not_allowed',
      detail: [
        { code: 'media_origin_not_allowed', detail: { urls: ['img/a.jpg'] } },
        { code: 'slug_mismatch', detail: { expected: 'aivideo', found: 'other' } },
      ],
    });
    expect(store.objects.size).toBe(0);
    expect(await count('funnels')).toBe(0);
  });

  it('413 for html over 1MB', async () => {
    const res = await publish('aivideo', funnelHtml('aivideo', 'x'.repeat(1024 * 1024)));
    expect(res.statusCode).toBe(413);
    expect(res.json().error).toBe('bundle_too_large');
  });

  it('400 when sha256 does not match the html', async () => {
    const res = await publish('aivideo', funnelHtml('aivideo'), { hash: 'a'.repeat(64) });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({ error: 'sha256_mismatch' });
  });

  it('400 for a slug that is not url-safe', async () => {
    expect((await publish('Bad_Slug', funnelHtml('Bad_Slug'))).statusCode).toBe(400);
  });

  it('403 for a router-only token', async () => {
    const router = await tokenFor(db.pool, 'router');
    expect((await publish('aivideo', funnelHtml('aivideo'), { token: router })).statusCode).toBe(403);
  });

  it('503 and no rows when R2 is down; works once R2 is back', async () => {
    store.fail();
    const res = await publish('aivideo', funnelHtml('aivideo'));
    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({ error: 'r2_unavailable' });
    expect(await count('versions')).toBe(0);
    expect(await count('funnels')).toBe(0);
    store.fail(false);
    expect((await publish('aivideo', funnelHtml('aivideo'))).json().v).toBe(1);
  });

  it('allocates distinct versions to concurrent publishes', async () => {
    const results = await Promise.all(['a', 'b', 'c'].map((m) => publish('aivideo', funnelHtml('aivideo', m))));
    expect(results.map((r) => r.statusCode)).toEqual([201, 201, 201]);
    expect(results.map((r) => r.json().v).sort()).toEqual([1, 2, 3]);
    expect([...store.objects.keys()].sort()).toEqual([
      'bundles/aivideo/v1/index.html', 'bundles/aivideo/v2/index.html', 'bundles/aivideo/v3/index.html',
    ]);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/core-api -- test/publish.test.js`
Expected: FAIL, mọi request trả `404` vì route chưa tồn tại.

- [ ] **Step 3: Implement**

`services/core-api/src/publisher/publish.js`:

```js
import { createHash } from 'node:crypto';
import { HttpError } from '../errors.js';
import { StoreUnavailableError } from './bundle-store.js';

export const sha256Hex = (s) => createHash('sha256').update(s).digest('hex');
export const bundleKey = (slug, n) => `bundles/${slug}/v${n}/index.html`;

export async function publishVersion({ pool, store, previewBaseUrl }, { slug, html, lintReport = {}, actor }) {
  const sha256 = sha256Hex(html);
  const result = (v, created) => ({ funnel: slug, v, sha256, created, previewUrl: `${previewBaseUrl}/${slug}/v${v}` });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('INSERT INTO funnels (slug, created_by) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING', [slug, actor]);
    // The row lock serializes publishes of one funnel: n is allocated once and no two R2 writes race.
    const funnelId = (await client.query('SELECT id FROM funnels WHERE slug = $1 FOR UPDATE', [slug])).rows[0].id;
    const latest = (
      await client.query('SELECT n, sha256 FROM versions WHERE funnel_id = $1 ORDER BY n DESC LIMIT 1', [funnelId])
    ).rows[0];
    if (latest?.sha256 === sha256) {
      await client.query('COMMIT');
      return result(latest.n, false);
    }
    const n = (latest?.n ?? 0) + 1;
    const key = bundleKey(slug, n);
    // R2 first: a crash after this leaves an unreferenced object, which the next publish of n overwrites.
    try {
      await store.put(key, html, { sha256 });
    } catch (err) {
      if (err instanceof StoreUnavailableError) throw new HttpError(503, 'r2_unavailable');
      throw err;
    }
    await client.query(
      `INSERT INTO versions (funnel_id, n, sha256, r2_key, size, lint_report, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [funnelId, n, sha256, key, Buffer.byteLength(html, 'utf8'), lintReport, actor],
    );
    await client.query('COMMIT');
    return result(n, true);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
```

`services/core-api/src/http/versions.js`:

```js
import { requireRole } from '../auth.js';
import { HttpError } from '../errors.js';
import { publishVersion, sha256Hex } from '../publisher/publish.js';
import { validateBundle } from '../publisher/validate.js';

export default async function versionsHttp(app, { pool, store, mediaOrigins, previewBaseUrl }) {
  app.post(
    '/v1/funnels/:slug/versions',
    {
      bodyLimit: 3 * 1024 * 1024,
      onRequest: requireRole(pool, 'publisher'),
      schema: {
        params: {
          type: 'object',
          required: ['slug'],
          properties: { slug: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,62}$' } },
        },
        body: {
          type: 'object',
          required: ['html', 'sha256'],
          properties: {
            html: { type: 'string', minLength: 1 },
            sha256: { type: 'string', pattern: '^[0-9a-f]{64}$' },
            lint_report: { type: 'object' },
          },
        },
      },
    },
    async (req, reply) => {
      const { slug } = req.params;
      const { html, sha256, lint_report: lintReport } = req.body;
      if (sha256Hex(html) !== sha256) throw new HttpError(400, 'sha256_mismatch');
      const check = validateBundle(html, { slug, mediaOrigins });
      if (!check.ok) throw new HttpError(check.status, check.errors[0].code, check.errors);
      const r = await publishVersion({ pool, store, previewBaseUrl }, { slug, html, lintReport, actor: req.actor });
      reply.code(r.created ? 201 : 200);
      return { funnel: r.funnel, v: r.v, sha256: r.sha256, created: r.created, preview_url: r.previewUrl };
    },
  );
}
```

`services/core-api/src/app.js`: thêm import và dòng đăng ký ngay dưới dòng `tokensHttp`:

```js
import versionsHttp from './http/versions.js';
```

```js
  if (deps?.pool) app.register(tokensHttp, deps);
  if (deps?.store) app.register(versionsHttp, deps);
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/core-api`
Expected: toàn bộ PASS (`publish.test.js` 10 test).

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(publisher): publish immutable funnel versions to R2 with sha256 dedupe"
```

---

### Task 7: Route, domain và chiếu sang KV

**Files:**
- Create: `services/core-api/src/publisher/routes.js`
- Create: `services/core-api/src/http/schemas.js`, `services/core-api/src/http/routes.js`, `services/core-api/src/http/domains.js`
- Modify: `services/core-api/src/app.js` (đăng ký plugin), `services/core-api/test/helpers/app.js` (thêm `seedVersions`)
- Test: `services/core-api/test/routes.test.js`

**Interfaces:**
- Consumes: `normalizePath`, `isValidPrefix`, `sortRoutes` (Task 1); `routeKey`, `KvUnavailableError` (Task 5); `publishVersion` (Task 6).
- Produces:
  - `PROPAGATION_SECONDS = 90`
  - `setRoute(pool, kv, { host, prefix, slug, v, actor, confirmFunnelChange?, log? })`
  - `rollbackRoute(pool, kv, { host, prefix, actor, log? })`
  - `removeRoute(pool, kv, { host, prefix, actor, log? })`
  - Ba hàm trên trả `{ host, prefix, funnel, v, rev, kv_sync: 'ok'|'pending', propagation_seconds: 90 }`. Với `removeRoute` thì `funnel` và `v` là route vừa gỡ.
  - `listRoutes(pool, host) → { host, status, rev, kv_synced_rev, routes: [{prefix, funnel, v, updated_by, updated_at}] }`
  - `syncHost(pool, kv, host): Promise<number>`: dựng lại toàn bộ JSON của host trong một advisory lock theo host, ghi KV, rồi nâng `kv_synced_rev`. Trả `rev` vừa ghi. Host lạ → `HttpError(404, 'domain_not_found')`. KV lỗi → ném `KvUnavailableError`.
  - HTTP:
    - `GET /v1/routes/:host` (router hoặc publisher)
    - `PUT /v1/routes/:host` `{prefix, funnel, v, confirm_funnel_change?}` (router)
    - `POST /v1/routes/:host/rollback` `{prefix}` (router)
    - `DELETE /v1/routes/:host?prefix=` (router)
    - `POST /v1/routes/:host/sync` (router) → `{host, rev, kv_sync: 'ok'}` hoặc `503 kv_unavailable`
    - `PUT /v1/domains/:host` `{status: 'active'|'disabled'}` (admin) → `{host, status}`
  - Mã lỗi: `400 invalid_prefix`, `404 domain_not_found`, `404 version_not_found`, `404 route_not_found`, `409 domain_disabled`, `409 funnel_change_requires_confirmation` (`detail: {from, to}`), `409 no_previous_version`.
  - Test helper: `seedVersions(pool, store, slug, count)` tạo v1..v<count>.

Quy tắc: mỗi thay đổi chạy trong một transaction khóa row `domains` (`FOR UPDATE`), nên các thay đổi trên cùng host được xếp hàng. Commit xong mới chiếu sang KV. KV lỗi thì vẫn trả 200 với `kv_sync: 'pending'`. Domain `disabled` chặn `set` và `rollback`, nhưng **cho phép `rm`**. Rollback lấy `from_version` của `route_events` gần nhất, nên rollback hai lần liên tiếp sẽ quay lại bản ban đầu.

- [ ] **Step 1: Thêm `seedVersions` vào helper**

Thêm vào cuối `services/core-api/test/helpers/app.js`:

```js
import { publishVersion } from '../../src/publisher/publish.js';
import { funnelHtml } from './pages.js';

export async function seedVersions(pool, store, slug, count) {
  for (let i = 1; i <= count; i += 1) {
    await publishVersion({ pool, store, previewBaseUrl: PREVIEW }, { slug, html: funnelHtml(slug, `v${i}`), actor: 'seed' });
  }
}
```

(Đưa hai dòng `import` lên đầu file cùng các import khác.)

- [ ] **Step 2: Viết test fail**

`services/core-api/test/routes.test.js`:

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { makeApp, tokenFor, bearer, seedVersions } from './helpers/app.js';

const HOST = 'try.x.com';

describe('routes', () => {
  let db;
  let app;
  let kv;
  let store;
  let router;
  let admin;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    ({ app, kv, store } = await makeApp(db.pool));
    router = await tokenFor(db.pool, 'router');
    admin = await tokenFor(db.pool, 'admin');
    await setDomain(HOST);
    await seedVersions(db.pool, store, 'aivideo', 3);
    await seedVersions(db.pool, store, 'other', 1);
  });
  afterEach(() => app.close());

  const setDomain = (host, status = 'active') =>
    app.inject({ method: 'PUT', url: `/v1/domains/${host}`, headers: bearer(admin), payload: { status } });
  const set = (prefix, funnel, v, extra = {}, host = HOST, token = router) =>
    app.inject({ method: 'PUT', url: `/v1/routes/${host}`, headers: bearer(token), payload: { prefix, funnel, v, ...extra } });
  const rollback = (prefix) =>
    app.inject({ method: 'POST', url: `/v1/routes/${HOST}/rollback`, headers: bearer(router), payload: { prefix } });
  const rm = (prefix) =>
    app.inject({ method: 'DELETE', url: `/v1/routes/${HOST}?prefix=${encodeURIComponent(prefix)}`, headers: bearer(router) });
  const list = (token = router) => app.inject({ method: 'GET', url: `/v1/routes/${HOST}`, headers: bearer(token) });
  const revs = async () =>
    (await db.pool.query('SELECT rev::int, kv_synced_rev::int FROM host_revs WHERE host = $1', [HOST])).rows[0];

  it('set stores the route, audits it and writes the full host projection to KV', async () => {
    const res = await set('/tiktok-ugc', 'aivideo', 3);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      host: HOST, prefix: '/tiktok-ugc', funnel: 'aivideo', v: 3, rev: 1, kv_sync: 'ok', propagation_seconds: 90,
    });
    expect(kv.doc(HOST)).toEqual({
      rev: 1,
      routes: [{ prefix: '/tiktok-ugc', bundle: 'bundles/aivideo/v3/index.html', funnel: 'aivideo', v: 3 }],
    });
    const events = (await db.pool.query('SELECT from_version, actor FROM route_events')).rows;
    expect(events).toEqual([{ from_version: null, actor: 'router' }]);
    expect(await revs()).toEqual({ rev: 1, kv_synced_rev: 1 });
  });

  it('normalizes prefixes and orders KV routes longest first', async () => {
    await set('/', 'aivideo', 1);
    const res = await set('/TikTok-UGC/', 'aivideo', 2);
    expect(res.json().prefix).toBe('/tiktok-ugc');
    expect(kv.doc(HOST).routes.map((r) => r.prefix)).toEqual(['/tiktok-ugc', '/']);
  });

  it('400 for a prefix that is not url-safe', async () => {
    const res = await set('/a b', 'aivideo', 1);
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('invalid_prefix');
  });

  it('404 for an unknown domain or version', async () => {
    expect((await set('/', 'aivideo', 1, {}, 'nope.x.com')).json().error).toBe('domain_not_found');
    expect((await set('/', 'aivideo', 9)).json()).toEqual({
      error: 'version_not_found', detail: { funnel: 'aivideo', v: 9 },
    });
  });

  it('a disabled domain refuses new routes but keeps serving and allows removal', async () => {
    await set('/', 'aivideo', 1);
    await setDomain(HOST, 'disabled');
    const res = await set('/b', 'aivideo', 1);
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe('domain_disabled');
    expect((await list()).json().routes.map((r) => r.prefix)).toEqual(['/']);
    expect(kv.doc(HOST).routes).toHaveLength(1);
    expect((await rm('/')).statusCode).toBe(200);
  });

  it('asks for confirmation before pointing a route at another funnel', async () => {
    await set('/', 'aivideo', 1);
    const res = await set('/', 'other', 1);
    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({ error: 'funnel_change_requires_confirmation', detail: { from: 'aivideo', to: 'other' } });
    const ok = await set('/', 'other', 1, { confirm_funnel_change: true });
    expect(ok.statusCode).toBe(200);
    expect(kv.doc(HOST).routes[0].funnel).toBe('other');
  });

  it('rollback returns to the previous version, and a second rollback undoes it', async () => {
    await set('/', 'aivideo', 1);
    await set('/', 'aivideo', 2);
    const first = await rollback('/');
    expect(first.statusCode).toBe(200);
    expect(first.json()).toMatchObject({ funnel: 'aivideo', v: 1, rev: 3, kv_sync: 'ok' });
    expect(kv.doc(HOST).routes[0].v).toBe(1);
    expect((await rollback('/')).json().v).toBe(2);
  });

  it('rollback: 409 without history, 404 without a route', async () => {
    await set('/', 'aivideo', 1);
    expect((await rollback('/')).json().error).toBe('no_previous_version');
    expect((await rollback('/nope')).json().error).toBe('route_not_found');
  });

  it('rm removes the route and publishes the shrunken projection', async () => {
    await set('/', 'aivideo', 1);
    const res = await rm('/');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ prefix: '/', funnel: 'aivideo', v: 1, kv_sync: 'ok' });
    expect(kv.doc(HOST)).toEqual({ rev: 2, routes: [] });
    expect((await rm('/')).json().error).toBe('route_not_found');
  });

  it('keeps the route and reports pending when KV is down', async () => {
    kv.fail();
    const res = await set('/', 'aivideo', 1);
    expect(res.statusCode).toBe(200);
    expect(res.json().kv_sync).toBe('pending');
    expect(kv.doc(HOST)).toBeUndefined();
    expect(await revs()).toEqual({ rev: 1, kv_synced_rev: 0 });
  });

  it('sync re-projects on demand and reports 503 while KV is down', async () => {
    kv.fail();
    await set('/', 'aivideo', 1);
    const down = await app.inject({ method: 'POST', url: `/v1/routes/${HOST}/sync`, headers: bearer(router) });
    expect(down.statusCode).toBe(503);
    expect(down.json()).toEqual({ error: 'kv_unavailable' });
    kv.fail(false);
    const up = await app.inject({ method: 'POST', url: `/v1/routes/${HOST}/sync`, headers: bearer(router) });
    expect(up.json()).toEqual({ host: HOST, rev: 1, kv_sync: 'ok' });
    expect(kv.doc(HOST).rev).toBe(1);
    expect(await revs()).toEqual({ rev: 1, kv_synced_rev: 1 });
  });

  it('only router or admin may change routes; publisher may read them', async () => {
    const publisher = await tokenFor(db.pool, 'publisher');
    expect((await set('/', 'aivideo', 1, {}, HOST, publisher)).statusCode).toBe(403);
    expect((await list(publisher)).statusCode).toBe(200);
    expect((await set('/', 'aivideo', 1, {}, HOST, admin)).statusCode).toBe(200);
  });

  it('concurrent sets leave KV identical to the database', async () => {
    const results = await Promise.all([1, 2, 3, 1, 2].map((v) => set('/', 'aivideo', v)));
    expect(results.every((r) => r.statusCode === 200)).toBe(true);
    const db_ = (await list()).json();
    expect(kv.doc(HOST).rev).toBe(db_.rev);
    expect(kv.doc(HOST).routes[0].v).toBe(db_.routes[0].v);
    expect(db_.kv_synced_rev).toBe(db_.rev);
  });

  it('GET lists routes with their sync state', async () => {
    await set('/', 'aivideo', 2);
    expect((await list()).json()).toEqual({
      host: HOST,
      status: 'active',
      rev: 1,
      kv_synced_rev: 1,
      routes: [{ prefix: '/', funnel: 'aivideo', v: 2, updated_by: 'router', updated_at: expect.any(String) }],
    });
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/core-api -- test/routes.test.js`
Expected: FAIL, `PUT /v1/domains/...` trả `404`.

- [ ] **Step 4: Implement**

`services/core-api/src/http/schemas.js`:

```js
export const hostParams = {
  type: 'object',
  required: ['host'],
  properties: {
    host: { type: 'string', maxLength: 253, pattern: '^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$' },
  },
};

export const prefixSchema = { type: 'string', minLength: 1, maxLength: 200 };
```

`services/core-api/src/publisher/routes.js`:

```js
import { isValidPrefix, normalizePath, sortRoutes } from '@ikf/route-match';
import { HttpError } from '../errors.js';
import { routeKey } from './route-kv.js';

export const PROPAGATION_SECONDS = 90;

function checkPrefix(prefix) {
  const p = normalizePath(prefix);
  if (!isValidPrefix(p)) throw new HttpError(400, 'invalid_prefix', { prefix });
  return p;
}

async function currentRoute(c, host, prefix) {
  const { rows } = await c.query(
    `SELECT r.version_id, f.slug, v.n
       FROM routes r JOIN versions v ON v.id = r.version_id JOIN funnels f ON f.id = v.funnel_id
      WHERE r.host = $1 AND r.path_prefix = $2`,
    [host, prefix],
  );
  return rows[0] ?? null;
}

// One transaction per change, serialized per host by the domains row lock; bumps host_revs.rev.
async function inHostTx(pool, host, { allowDisabled = false } = {}, fn) {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const { rows } = await c.query('SELECT status FROM domains WHERE host = $1 FOR UPDATE', [host]);
    if (!rows.length) throw new HttpError(404, 'domain_not_found', { host });
    if (rows[0].status === 'disabled' && !allowDisabled) throw new HttpError(409, 'domain_disabled', { host });
    const out = await fn(c);
    const rev = (await c.query('UPDATE host_revs SET rev = rev + 1 WHERE host = $1 RETURNING rev', [host])).rows[0].rev;
    await c.query('COMMIT');
    return { ...out, rev: Number(rev) };
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    c.release();
  }
}

async function trySync(pool, kv, host, log) {
  try {
    await syncHost(pool, kv, host);
    return { kv_sync: 'ok', propagation_seconds: PROPAGATION_SECONDS };
  } catch (err) {
    log?.warn({ host, err: err.message }, 'kv sync failed; resync job will retry');
    return { kv_sync: 'pending', propagation_seconds: PROPAGATION_SECONDS };
  }
}

export async function setRoute(pool, kv, { host, prefix, slug, v, actor, confirmFunnelChange = false, log }) {
  const p = checkPrefix(prefix);
  const out = await inHostTx(pool, host, {}, async (c) => {
    const ver = (
      await c.query('SELECT v.id FROM versions v JOIN funnels f ON f.id = v.funnel_id WHERE f.slug = $1 AND v.n = $2', [slug, v])
    ).rows[0];
    if (!ver) throw new HttpError(404, 'version_not_found', { funnel: slug, v });
    const cur = await currentRoute(c, host, p);
    if (cur && cur.slug !== slug && !confirmFunnelChange) {
      throw new HttpError(409, 'funnel_change_requires_confirmation', { from: cur.slug, to: slug });
    }
    if (cur?.version_id !== ver.id) {
      await c.query(
        `INSERT INTO routes (host, path_prefix, version_id, updated_by) VALUES ($1, $2, $3, $4)
         ON CONFLICT (host, path_prefix)
         DO UPDATE SET version_id = EXCLUDED.version_id, updated_by = EXCLUDED.updated_by, updated_at = now()`,
        [host, p, ver.id, actor],
      );
      await c.query(
        'INSERT INTO route_events (host, path_prefix, from_version, to_version, actor) VALUES ($1, $2, $3, $4, $5)',
        [host, p, cur?.version_id ?? null, ver.id, actor],
      );
    }
    return { host, prefix: p, funnel: slug, v };
  });
  return { ...out, ...(await trySync(pool, kv, host, log)) };
}

export async function rollbackRoute(pool, kv, { host, prefix, actor, log }) {
  const p = checkPrefix(prefix);
  const out = await inHostTx(pool, host, {}, async (c) => {
    const cur = await currentRoute(c, host, p);
    if (!cur) throw new HttpError(404, 'route_not_found', { host, prefix: p });
    const last = (
      await c.query(
        'SELECT from_version FROM route_events WHERE host = $1 AND path_prefix = $2 ORDER BY id DESC LIMIT 1',
        [host, p],
      )
    ).rows[0];
    if (!last?.from_version) throw new HttpError(409, 'no_previous_version', { host, prefix: p });
    await c.query('UPDATE routes SET version_id = $3, updated_by = $4, updated_at = now() WHERE host = $1 AND path_prefix = $2', [
      host, p, last.from_version, actor,
    ]);
    await c.query(
      'INSERT INTO route_events (host, path_prefix, from_version, to_version, actor) VALUES ($1, $2, $3, $4, $5)',
      [host, p, cur.version_id, last.from_version, actor],
    );
    const to = (
      await c.query('SELECT f.slug, v.n FROM versions v JOIN funnels f ON f.id = v.funnel_id WHERE v.id = $1', [last.from_version])
    ).rows[0];
    return { host, prefix: p, funnel: to.slug, v: to.n };
  });
  return { ...out, ...(await trySync(pool, kv, host, log)) };
}

export async function removeRoute(pool, kv, { host, prefix, actor, log }) {
  const p = checkPrefix(prefix);
  const out = await inHostTx(pool, host, { allowDisabled: true }, async (c) => {
    const cur = await currentRoute(c, host, p);
    if (!cur) throw new HttpError(404, 'route_not_found', { host, prefix: p });
    await c.query('DELETE FROM routes WHERE host = $1 AND path_prefix = $2', [host, p]);
    await c.query(
      'INSERT INTO route_events (host, path_prefix, from_version, to_version, actor) VALUES ($1, $2, $3, NULL, $4)',
      [host, p, cur.version_id, actor],
    );
    return { host, prefix: p, funnel: cur.slug, v: cur.n };
  });
  return { ...out, ...(await trySync(pool, kv, host, log)) };
}

export async function listRoutes(pool, host) {
  const d = (
    await pool.query(
      'SELECT d.status, h.rev, h.kv_synced_rev FROM domains d JOIN host_revs h USING (host) WHERE d.host = $1',
      [host],
    )
  ).rows[0];
  if (!d) throw new HttpError(404, 'domain_not_found', { host });
  const { rows } = await pool.query(
    `SELECT r.path_prefix AS prefix, f.slug AS funnel, v.n AS v, r.updated_by, r.updated_at
       FROM routes r JOIN versions v ON v.id = r.version_id JOIN funnels f ON f.id = v.funnel_id
      WHERE r.host = $1`,
    [host],
  );
  return { host, status: d.status, rev: Number(d.rev), kv_synced_rev: Number(d.kv_synced_rev), routes: sortRoutes(rows) };
}

// Rebuilds the whole host document under a per-host lock, so the last KV write always carries
// the newest routes even when several syncs for one host run at once.
export async function syncHost(pool, kv, host) {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`kv:${host}`]);
    const hr = (await c.query('SELECT rev FROM host_revs WHERE host = $1', [host])).rows[0];
    if (!hr) throw new HttpError(404, 'domain_not_found', { host });
    const rev = Number(hr.rev);
    const { rows } = await c.query(
      `SELECT r.path_prefix AS prefix, v.r2_key AS bundle, f.slug AS funnel, v.n AS v
         FROM routes r JOIN versions v ON v.id = r.version_id JOIN funnels f ON f.id = v.funnel_id
        WHERE r.host = $1`,
      [host],
    );
    await kv.put(routeKey(host), JSON.stringify({ rev, routes: sortRoutes(rows) }));
    await c.query('UPDATE host_revs SET kv_synced_rev = GREATEST(kv_synced_rev, $2) WHERE host = $1', [host, rev]);
    await c.query('COMMIT');
    return rev;
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    c.release();
  }
}
```

`services/core-api/src/http/routes.js`:

```js
import { requireRole } from '../auth.js';
import { HttpError } from '../errors.js';
import { KvUnavailableError } from '../publisher/route-kv.js';
import { listRoutes, removeRoute, rollbackRoute, setRoute, syncHost } from '../publisher/routes.js';
import { hostParams, prefixSchema } from './schemas.js';

export default async function routesHttp(app, { pool, kv }) {
  const router = requireRole(pool, 'router');
  const prefixBody = { type: 'object', required: ['prefix'], properties: { prefix: prefixSchema } };

  app.get('/v1/routes/:host', { onRequest: requireRole(pool, ['router', 'publisher']), schema: { params: hostParams } }, async (req) =>
    listRoutes(pool, req.params.host),
  );

  app.put(
    '/v1/routes/:host',
    {
      onRequest: router,
      schema: {
        params: hostParams,
        body: {
          type: 'object',
          required: ['prefix', 'funnel', 'v'],
          properties: {
            prefix: prefixSchema,
            funnel: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{1,62}$' },
            v: { type: 'integer', minimum: 1 },
            confirm_funnel_change: { type: 'boolean' },
          },
        },
      },
    },
    async (req) =>
      setRoute(pool, kv, {
        host: req.params.host,
        prefix: req.body.prefix,
        slug: req.body.funnel,
        v: req.body.v,
        actor: req.actor,
        confirmFunnelChange: req.body.confirm_funnel_change === true,
        log: req.log,
      }),
  );

  app.post('/v1/routes/:host/rollback', { onRequest: router, schema: { params: hostParams, body: prefixBody } }, async (req) =>
    rollbackRoute(pool, kv, { host: req.params.host, prefix: req.body.prefix, actor: req.actor, log: req.log }),
  );

  app.delete('/v1/routes/:host', { onRequest: router, schema: { params: hostParams, querystring: prefixBody } }, async (req) =>
    removeRoute(pool, kv, { host: req.params.host, prefix: req.query.prefix, actor: req.actor, log: req.log }),
  );

  app.post('/v1/routes/:host/sync', { onRequest: router, schema: { params: hostParams } }, async (req) => {
    try {
      return { host: req.params.host, rev: await syncHost(pool, kv, req.params.host), kv_sync: 'ok' };
    } catch (err) {
      if (err instanceof KvUnavailableError) throw new HttpError(503, 'kv_unavailable');
      throw err;
    }
  });
}
```

`services/core-api/src/http/domains.js`:

```js
import { requireRole } from '../auth.js';
import { hostParams } from './schemas.js';

// Called by scripts/sync-domains.sh after terraform apply; Terraform owns the list of domains.
export default async function domainsHttp(app, { pool }) {
  app.put(
    '/v1/domains/:host',
    {
      onRequest: requireRole(pool, 'admin'),
      schema: {
        params: hostParams,
        body: { type: 'object', required: ['status'], properties: { status: { enum: ['active', 'disabled'] } } },
      },
    },
    async (req) => {
      const { host } = req.params;
      const { status } = req.body;
      await pool.query(
        'INSERT INTO domains (host, status) VALUES ($1, $2) ON CONFLICT (host) DO UPDATE SET status = EXCLUDED.status',
        [host, status],
      );
      await pool.query('INSERT INTO host_revs (host) VALUES ($1) ON CONFLICT (host) DO NOTHING', [host]);
      return { host, status };
    },
  );
}
```

`services/core-api/src/app.js`: thêm import và đăng ký:

```js
import routesHttp from './http/routes.js';
import domainsHttp from './http/domains.js';
```

```js
  if (deps?.pool) app.register(tokensHttp, deps);
  if (deps?.pool) app.register(domainsHttp, deps);
  if (deps?.store) app.register(versionsHttp, deps);
  if (deps?.kv) app.register(routesHttp, deps);
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/core-api`
Expected: toàn bộ PASS (`routes.test.js` 13 test).

- [ ] **Step 6: Commit**

```bash
git add services/core-api
git commit -m "feat(publisher): routes, rollback and domains with per-host KV projection"
```

---

### Task 8: Job nền đồng bộ lại KV

**Files:**
- Create: `services/core-api/src/publisher/resync.js`
- Test: `services/core-api/test/resync.test.js`

**Interfaces:**
- Consumes: `setRoute`, `syncHost` (Task 7).
- Produces:
  - `resyncPending(pool, kv, log?): Promise<string[]>`: chiếu lại mọi host có `kv_synced_rev < rev`. Một host lỗi không chặn host khác. Trả danh sách host đã đồng bộ được.
  - `startResync({ pool, kv, log, intervalMs = 60000 }): () => void`: chạy định kỳ, không chồng lượt (`running` flag), timer `unref`. Trả hàm dừng.

- [ ] **Step 1: Viết test fail**

`services/core-api/test/resync.test.js`:

```js
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { startDb, resetDb } from './helpers/db.js';
import { fakeKv, fakeStore } from './helpers/fakes.js';
import { seedVersions } from './helpers/app.js';
import { setRoute } from '../src/publisher/routes.js';
import { resyncPending, startResync } from '../src/publisher/resync.js';

const silent = { warn: () => {}, error: () => {} };

describe('KV resync', () => {
  let db;
  let kv;

  beforeAll(async () => {
    db = await startDb();
  });
  afterAll(() => db.stop());
  beforeEach(async () => {
    await resetDb(db.pool);
    kv = fakeKv();
    for (const host of ['a.x.com', 'b.x.com']) {
      await db.pool.query("INSERT INTO domains (host, status) VALUES ($1, 'active')", [host]);
      await db.pool.query('INSERT INTO host_revs (host) VALUES ($1)', [host]);
    }
    await seedVersions(db.pool, fakeStore(), 'aivideo', 1);
  });

  const setWhileKvDown = async (host) => {
    kv.fail();
    const r = await setRoute(db.pool, kv, { host, prefix: '/', slug: 'aivideo', v: 1, actor: 't' });
    kv.fail(false);
    expect(r.kv_sync).toBe('pending');
  };

  it('re-projects hosts whose KV lags behind the database, then has nothing to do', async () => {
    await setWhileKvDown('a.x.com');
    expect(await resyncPending(db.pool, kv, silent)).toEqual(['a.x.com']);
    expect(kv.doc('a.x.com')).toEqual({
      rev: 1,
      routes: [{ prefix: '/', bundle: 'bundles/aivideo/v1/index.html', funnel: 'aivideo', v: 1 }],
    });
    expect(await resyncPending(db.pool, kv, silent)).toEqual([]);
  });

  it('one failing host does not block the others', async () => {
    await setWhileKvDown('a.x.com');
    await setWhileKvDown('b.x.com');
    const warn = vi.fn();
    const flaky = {
      put: (key, value) => (key === 'route:a.x.com' ? Promise.reject(new Error('boom')) : kv.put(key, value)),
    };
    expect(await resyncPending(db.pool, flaky, { ...silent, warn })).toEqual(['b.x.com']);
    expect(warn).toHaveBeenCalledWith({ host: 'a.x.com', err: 'boom' }, 'kv resync failed');
  });

  it('startResync runs on an interval until stopped', async () => {
    await setWhileKvDown('a.x.com');
    const stop = startResync({ pool: db.pool, kv, log: silent, intervalMs: 20 });
    await vi.waitFor(() => expect(kv.doc('a.x.com')?.rev).toBe(1), { timeout: 2000 });
    stop();
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/core-api -- test/resync.test.js`
Expected: FAIL với `Failed to load url ../src/publisher/resync.js`.

- [ ] **Step 3: Implement**

`services/core-api/src/publisher/resync.js`:

```js
import { syncHost } from './routes.js';

export async function resyncPending(pool, kv, log = console) {
  const { rows } = await pool.query('SELECT host FROM host_revs WHERE kv_synced_rev < rev ORDER BY host');
  const synced = [];
  for (const { host } of rows) {
    try {
      await syncHost(pool, kv, host);
      synced.push(host);
    } catch (err) {
      log.warn({ host, err: err.message }, 'kv resync failed');
    }
  }
  return synced;
}

export function startResync({ pool, kv, log, intervalMs = 60_000 }) {
  let running = false;
  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      await resyncPending(pool, kv, log);
    } catch (err) {
      log.error({ err: err.message }, 'kv resync loop failed');
    } finally {
      running = false;
    }
  }, intervalMs);
  timer.unref();
  return () => clearInterval(timer);
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/core-api -- test/resync.test.js`
Expected: `3 passed`.

- [ ] **Step 5: Commit**

```bash
git add services/core-api
git commit -m "feat(publisher): background job re-projects hosts whose KV lags the database"
```

---

### Task 9: Nối `server.js`: config, secrets, migrate, token bootstrap

**Files:**
- Create: `services/core-api/src/config.js`, `services/core-api/src/secrets.js`
- Modify: `services/core-api/src/server.js` (thay toàn bộ)
- Test: `services/core-api/test/config.test.js`

**Interfaces:**
- Consumes: mọi thứ từ Task 2–8. Biến môi trường do Task 12 thêm vào ECS: `CF_ACCOUNT_ID`, `R2_BUCKET`, `KV_NAMESPACE_ID`, `MEDIA_ORIGINS`, `PREVIEW_BASE_URL`. Biến sẵn có từ plan infra: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `REDIS_HOST`, `SECRETS_PREFIX`.
- Produces:
  - `loadConfig(env = process.env)` → `{ db: {host, user, password}, redisHost, cfAccountId, r2Bucket, kvNamespaceId, mediaOrigins: string[], previewBaseUrl, secretsPrefix }`. Thiếu biến → ném `missing env: A, B`. Media origin không phải `https:` → ném lỗi.
  - `loadSecrets(prefix, names, client?)` → `{ [name]: string | null }`. Secret chưa có giá trị (`ResourceNotFoundException`) → `null`.
  - Secrets cần (Task 12 tạo, Task 0 nhập giá trị): `cf-kv-api-token`, `r2-access-key-id`, `r2-secret-access-key` (bắt buộc; thiếu thì process thoát mã 1), `bootstrap-admin-token` (tùy chọn).

- [ ] **Step 1: Cài dependency**

```bash
npm install -w @ikf/core-api @aws-sdk/client-secrets-manager@^3
```

- [ ] **Step 2: Viết test fail**

`services/core-api/test/config.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { loadConfig } from '../src/config.js';
import { loadSecrets } from '../src/secrets.js';

const ENV = {
  DB_HOST: 'proxy', DB_USER: 'u', DB_PASSWORD: 'p', REDIS_HOST: 'r',
  CF_ACCOUNT_ID: 'acc', R2_BUCKET: 'ikf-bundles-staging', KV_NAMESPACE_ID: 'ns',
  MEDIA_ORIGINS: ' https://media.test/funnels/ , https://media2.test/ ',
  PREVIEW_BASE_URL: 'https://preview.ikf-staging.example/',
  SECRETS_PREFIX: 'ikf/staging/',
};

describe('loadConfig', () => {
  it('parses the environment', () => {
    expect(loadConfig(ENV)).toEqual({
      db: { host: 'proxy', user: 'u', password: 'p' },
      redisHost: 'r',
      cfAccountId: 'acc',
      r2Bucket: 'ikf-bundles-staging',
      kvNamespaceId: 'ns',
      mediaOrigins: ['https://media.test/funnels/', 'https://media2.test/'],
      previewBaseUrl: 'https://preview.ikf-staging.example',
      secretsPrefix: 'ikf/staging/',
    });
  });

  it('names every missing variable', () => {
    const { R2_BUCKET, KV_NAMESPACE_ID, ...rest } = ENV;
    expect(() => loadConfig(rest)).toThrow('missing env: R2_BUCKET, KV_NAMESPACE_ID');
  });

  it('rejects media origins that are not https', () => {
    expect(() => loadConfig({ ...ENV, MEDIA_ORIGINS: 'http://media.test/' })).toThrow(/https/);
  });
});

describe('loadSecrets', () => {
  const client = (values) => ({
    send: async (cmd) => {
      const v = values[cmd.input.SecretId];
      if (v instanceof Error) throw v;
      return { SecretString: v };
    },
  });
  const notFound = Object.assign(new Error('no value'), { name: 'ResourceNotFoundException' });

  it('returns values by short name and null for secrets without a value', async () => {
    const out = await loadSecrets('ikf/staging/', ['a', 'b'], client({ 'ikf/staging/a': 'A', 'ikf/staging/b': notFound }));
    expect(out).toEqual({ a: 'A', b: null });
  });

  it('rethrows other errors', async () => {
    const denied = Object.assign(new Error('denied'), { name: 'AccessDeniedException' });
    await expect(loadSecrets('p/', ['a'], client({ 'p/a': denied }))).rejects.toThrow('denied');
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/core-api -- test/config.test.js`
Expected: FAIL với `Failed to load url ../src/config.js`.

- [ ] **Step 4: Implement**

`services/core-api/src/config.js`:

```js
const REQUIRED = [
  'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'REDIS_HOST',
  'CF_ACCOUNT_ID', 'R2_BUCKET', 'KV_NAMESPACE_ID', 'MEDIA_ORIGINS', 'PREVIEW_BASE_URL', 'SECRETS_PREFIX',
];

export function loadConfig(env = process.env) {
  const missing = REQUIRED.filter((k) => !env[k]);
  if (missing.length) throw new Error(`missing env: ${missing.join(', ')}`);
  const mediaOrigins = env.MEDIA_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
  for (const origin of mediaOrigins) {
    if (new URL(origin).protocol !== 'https:') throw new Error(`MEDIA_ORIGINS entries must be https: ${origin}`);
  }
  return {
    db: { host: env.DB_HOST, user: env.DB_USER, password: env.DB_PASSWORD },
    redisHost: env.REDIS_HOST,
    cfAccountId: env.CF_ACCOUNT_ID,
    r2Bucket: env.R2_BUCKET,
    kvNamespaceId: env.KV_NAMESPACE_ID,
    mediaOrigins,
    previewBaseUrl: env.PREVIEW_BASE_URL.replace(/\/+$/, ''),
    secretsPrefix: env.SECRETS_PREFIX,
  };
}
```

`services/core-api/src/secrets.js`:

```js
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

export async function loadSecrets(prefix, names, client = new SecretsManagerClient({ region: 'us-east-1' })) {
  const out = {};
  for (const name of names) {
    try {
      const res = await client.send(new GetSecretValueCommand({ SecretId: `${prefix}${name}` }));
      out[name] = res.SecretString ?? null;
    } catch (err) {
      // The infra modules create secrets without a value; a value is entered by hand later.
      if (err.name !== 'ResourceNotFoundException') throw err;
      out[name] = null;
    }
  }
  return out;
}
```

`services/core-api/src/server.js` (thay toàn bộ):

```js
import pg from 'pg';
import { createClient } from 'redis';
import { buildApp } from './app.js';
import { ensureToken } from './auth.js';
import { loadConfig } from './config.js';
import { migrate } from './db/migrate.js';
import { loadSecrets } from './secrets.js';
import { createR2Store } from './publisher/bundle-store.js';
import { createKvClient } from './publisher/route-kv.js';
import { startResync } from './publisher/resync.js';

const REQUIRED_SECRETS = ['cf-kv-api-token', 'r2-access-key-id', 'r2-secret-access-key'];

const config = loadConfig();
const secrets = await loadSecrets(config.secretsPrefix, [...REQUIRED_SECRETS, 'bootstrap-admin-token']);
const missing = REQUIRED_SECRETS.filter((n) => !secrets[n]);
if (missing.length) {
  console.error(`missing secret values: ${missing.map((n) => config.secretsPrefix + n).join(', ')}`);
  process.exit(1);
}

const pool = new pg.Pool({
  host: config.db.host,
  port: 5432,
  database: 'ikf',
  user: config.db.user,
  password: config.db.password,
  ssl: { rejectUnauthorized: true },
  max: 10,
  idleTimeoutMillis: 30000,
});

const redis = createClient({ url: `rediss://${config.redisHost}:6379` });
redis.on('error', (err) => console.error('redis error', err.message));
await redis.connect().catch((err) => console.error('redis connect failed', err.message));

await migrate(pool);
if (secrets['bootstrap-admin-token']) {
  await ensureToken(pool, { name: 'bootstrap', roles: ['admin'], token: secrets['bootstrap-admin-token'] });
}

const store = createR2Store({
  accountId: config.cfAccountId,
  bucket: config.r2Bucket,
  accessKeyId: secrets['r2-access-key-id'],
  secretAccessKey: secrets['r2-secret-access-key'],
});
const kv = createKvClient({
  accountId: config.cfAccountId,
  namespaceId: config.kvNamespaceId,
  apiToken: secrets['cf-kv-api-token'],
});

const app = buildApp({
  logger: true,
  checks: {
    db: () => pool.query('select 1'),
    cache: () => redis.ping(),
  },
  deps: { pool, store, kv, mediaOrigins: config.mediaOrigins, previewBaseUrl: config.previewBaseUrl },
});

const stopResync = startResync({ pool, kv, log: app.log });

const shutdown = async () => {
  stopResync();
  await app.close();
  await Promise.allSettled([pool.end(), redis.quit()]);
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

await app.listen({ host: '0.0.0.0', port: 8080 });
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/core-api`
Expected: toàn bộ PASS (`config.test.js` 5 test).

- [ ] **Step 6: Kiểm tra server dừng rõ ràng khi thiếu cấu hình**

Run: `cd services/core-api && env -i PATH="$PATH" node src/server.js; echo "exit=$?"`
Expected: in `Error: missing env: DB_HOST, ...` và `exit=1`.

- [ ] **Step 7: Build image và commit**

```bash
cd /Users/daothinh/ikf-platform
docker buildx build --platform linux/arm64 -f services/core-api/Dockerfile -t ikf-core-api:local .
git add services/core-api package-lock.json
git commit -m "feat(core-api): wire publisher with config, secrets, migrations and resync"
```

---
### Task 10: Worker `edge-router`: định tuyến, chèn `__IKF`, preview

**Files:**
- Create: `workers/edge-router/package.json`, `workers/edge-router/wrangler.json`, `workers/edge-router/vitest.config.js`
- Create: `workers/edge-router/src/index.js`, `src/routes.js`, `src/bundle.js`, `src/inject.js`, `src/responses.js`
- Test: `workers/edge-router/test/inject.test.js`, `workers/edge-router/test/router.test.js`

**Interfaces:**
- Consumes: `matchRoute` (Task 1). KV document format đúng như Task 7 ghi (`{rev, routes:[{prefix,bundle,funnel,v}]}`).
- Produces:
  - Binding: `ROUTES` (KV), `BUNDLES` (R2), var `PREVIEW_HOST`.
  - `getHostRoutes(env, host, now = Date.now())` → doc hoặc `null`. Đọc với `cacheTtl: 30`, giữ bản đọc được gần nhất trong bộ nhớ isolate. Task 11 dùng bản này làm dự phòng.
  - `resetRouteMemory()` (chỉ dùng trong test)
  - `getBundle(env, ctx, key)` → `string | null` (Cache API trước, rồi R2)
  - `injectIkf(html, { funnel, v, rev, preview })` → html
  - `htmlResponse(request, html, target)`, `errorResponse(request, status, extraHeaders?)`, `log(fields)`
  - Worker name khi deploy: `ikf-edge-router-<env>` (Task 12 trỏ route vào tên này).

- [ ] **Step 1: Khởi tạo package**

```bash
mkdir -p workers/edge-router/src workers/edge-router/test workers/edge-router/scripts
cat > workers/edge-router/package.json <<'EOF'
{
  "name": "@ikf/edge-router",
  "private": true,
  "type": "module",
  "scripts": { "test": "vitest run" },
  "dependencies": { "@ikf/route-match": "*" },
  "devDependencies": {
    "@cloudflare/vitest-pool-workers": "^0.8.0",
    "vitest": "~3.2.0",
    "wrangler": "^4.0.0"
  }
}
EOF
npm install
```

`workers/edge-router/wrangler.json` (cấu hình cho test và dev local; deploy dùng file sinh ở Task 12):

```json
{
  "name": "ikf-edge-router",
  "main": "src/index.js",
  "compatibility_date": "2026-09-01",
  "observability": { "enabled": true },
  "vars": { "PREVIEW_HOST": "preview.ikf-staging.example" },
  "kv_namespaces": [{ "binding": "ROUTES", "id": "local-routes" }],
  "r2_buckets": [{ "binding": "BUNDLES", "bucket_name": "local-bundles" }]
}
```

`workers/edge-router/vitest.config.js`:

```js
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: { wrangler: { configPath: './wrangler.json' } },
    },
  },
});
```

- [ ] **Step 2: Viết test fail**

`workers/edge-router/test/inject.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { injectIkf } from '../src/inject.js';

const T = { funnel: 'aivideo', v: 3, rev: 7, preview: false };
const TAG = '<script>window.__IKF={"funnel":"aivideo","v":3,"rev":7}</script>';

describe('injectIkf', () => {
  it('goes right after <head>, keeping its attributes', () => {
    expect(injectIkf('<!doctype html><html><head lang="en"><title>x</title></head></html>', T)).toBe(
      `<!doctype html><html><head lang="en">${TAG}<title>x</title></head></html>`,
    );
  });

  it('goes right after the doctype when there is no <head>', () => {
    expect(injectIkf('<!DOCTYPE html>\n<body><header>x</header></body>', T)).toBe(
      `<!DOCTYPE html>${TAG}\n<body><header>x</header></body>`,
    );
  });

  it('goes first when there is neither <head> nor doctype', () => {
    expect(injectIkf('<body>x</body>', T)).toBe(`${TAG}<body>x</body>`);
  });

  it('marks previews', () => {
    expect(injectIkf('<head></head>', { ...T, preview: true })).toBe(
      '<head><script>window.__IKF={"funnel":"aivideo","v":3,"rev":7,"preview":true}</script></head>',
    );
  });

  it('cannot break out of the script element', () => {
    const out = injectIkf('<head></head>', { ...T, funnel: '</script><b>' });
    expect(out).not.toContain('</script><b>');
    expect(out).toContain('\\u003c/script>\\u003cb>');
  });
});
```

`workers/edge-router/test/router.test.js`:

```js
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';
import worker from '../src/index.js';
import { resetRouteMemory } from '../src/routes.js';

const HOST = 'try.aivideo.app';
const PREVIEW = 'preview.ikf-staging.example';
const page = (marker) => `<!doctype html><html><head><title>${marker}</title></head><body>${marker}</body></html>`;

async function call(url, init = {}, e = env) {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(url, init), e, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

beforeEach(async () => {
  resetRouteMemory();
  await env.ROUTES.put(
    `route:${HOST}`,
    JSON.stringify({
      rev: 7,
      routes: [
        { prefix: '/tiktok-ugc', bundle: 'bundles/aivideo/v3/index.html', funnel: 'aivideo', v: 3 },
        { prefix: '/', bundle: 'bundles/aivideo/v2/index.html', funnel: 'aivideo', v: 2 },
      ],
    }),
  );
  await env.BUNDLES.put('bundles/aivideo/v3/index.html', page('v3'));
  await env.BUNDLES.put('bundles/aivideo/v2/index.html', page('v2'));
});

describe('edge-router', () => {
  it.each([
    ['/tiktok-ugc?fbclid=abc&utm_source=fb', 'aivideo@3; rev=7'],
    ['/TikTok-UGC/', 'aivideo@3; rev=7'],
    ['/tiktok-ugc/step/2', 'aivideo@3; rev=7'],
    ['/tiktok-ugc-2', 'aivideo@2; rev=7'],
    ['/', 'aivideo@2; rev=7'],
  ])('%s -> %s', async (path, xikf) => {
    const res = await call(`https://${HOST}${path}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-ikf')).toBe(xikf);
  });

  it('injects __IKF right after <head>', async () => {
    const res = await call(`https://${HOST}/tiktok-ugc`);
    expect(await res.text()).toBe(
      '<!doctype html><html><head><script>window.__IKF={"funnel":"aivideo","v":3,"rev":7}</script><title>v3</title></head><body>v3</body></html>',
    );
  });

  it('sets the funnel response headers', async () => {
    const res = await call(`https://${HOST}/`);
    expect(Object.fromEntries(res.headers)).toMatchObject({
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-cache',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'x-content-type-options': 'nosniff',
    });
    expect(res.headers.has('x-robots-tag')).toBe(false);
    expect(res.headers.has('content-security-policy')).toBe(false);
  });

  it('404 for an unknown host', async () => {
    const res = await call('https://unknown.example/');
    expect(res.status).toBe(404);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('404 when no prefix matches', async () => {
    await env.ROUTES.put('route:only-a.example', JSON.stringify({ rev: 1, routes: [{ prefix: '/a', bundle: 'x', funnel: 'f', v: 1 }] }));
    expect((await call('https://only-a.example/b')).status).toBe(404);
  });

  it('405 for methods other than GET and HEAD', async () => {
    const res = await call(`https://${HOST}/`, { method: 'POST' });
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('GET, HEAD');
  });

  it('HEAD returns the headers without a body', async () => {
    const res = await call(`https://${HOST}/`, { method: 'HEAD' });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-ikf')).toBe('aivideo@2; rev=7');
    expect(await res.text()).toBe('');
  });

  it('serves from the edge cache once fetched, whatever the query string', async () => {
    await call(`https://${HOST}/tiktok-ugc?fbclid=1`);
    await env.BUNDLES.delete('bundles/aivideo/v3/index.html');
    const res = await call(`https://${HOST}/tiktok-ugc?fbclid=2`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('<title>v3</title>');
  });

  it('serves previews straight from R2 with noindex', async () => {
    const res = await call(`https://${PREVIEW}/aivideo/v3`);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
    expect(res.headers.get('x-ikf')).toBe('aivideo@3; rev=0');
    expect(await res.text()).toContain('window.__IKF={"funnel":"aivideo","v":3,"rev":0,"preview":true}');
  });

  it.each(['/aivideo/v9', '/aivideo', '/', '/AIVIDEO/v3/x'])('404 for preview path %s', async (path) => {
    expect((await call(`https://${PREVIEW}${path}`)).status).toBe(404);
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/edge-router`
Expected: FAIL với `Failed to load url ../src/inject.js` và `../src/index.js`.

- [ ] **Step 4: Implement**

`workers/edge-router/src/inject.js`:

```js
const HEAD_OPEN = /<head(?:\s[^>]*)?>/i;
const DOCTYPE = /^\s*<!doctype[^>]*>/i;

// String insertion instead of HTMLRewriter: bundles are ≤1MB, and 21 of 67 funnels have no <head>.
export function injectIkf(html, { funnel, v, rev, preview }) {
  const data = JSON.stringify({ funnel, v, rev, ...(preview && { preview: true }) }).replace(/</g, '\\u003c');
  const tag = `<script>window.__IKF=${data}</script>`;
  const anchor = HEAD_OPEN.exec(html) ?? DOCTYPE.exec(html);
  if (!anchor) return tag + html;
  const at = anchor.index + anchor[0].length;
  return html.slice(0, at) + tag + html.slice(at);
}
```

`workers/edge-router/src/routes.js`:

```js
const STALE_MAX_MS = 10 * 60 * 1000;
const memory = new Map(); // host -> { doc, at }

export class RoutesUnavailableError extends Error {}

export async function getHostRoutes(env, host, now = Date.now()) {
  try {
    const doc = await env.ROUTES.get(`route:${host}`, { type: 'json', cacheTtl: 30 });
    if (doc) memory.set(host, { doc, at: now });
    else memory.delete(host);
    return doc;
  } catch (err) {
    // KV outage: keep serving the last routes this isolate saw, for a bounded time.
    const hit = memory.get(host);
    if (hit && now - hit.at <= STALE_MAX_MS) return hit.doc;
    throw new RoutesUnavailableError(err.message);
  }
}

export function resetRouteMemory() {
  memory.clear();
}
```

`workers/edge-router/src/bundle.js`:

```js
const CACHE_ORIGIN = 'https://bundles.ikf.internal/';

// Bundles are immutable per key, so the edge cache never needs invalidating.
export async function getBundle(env, ctx, key) {
  const cacheKey = new Request(CACHE_ORIGIN + key);
  const hit = await caches.default.match(cacheKey);
  if (hit) return hit.text();
  const obj = await env.BUNDLES.get(key);
  if (!obj) return null;
  const html = await obj.text();
  ctx.waitUntil(
    caches.default.put(
      cacheKey,
      new Response(html, {
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=31536000, immutable' },
      }),
    ),
  );
  return html;
}
```

`workers/edge-router/src/responses.js`:

```js
const BASE = {
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
};

const TITLES = { 404: 'Not found', 405: 'Method not allowed', 502: 'Bad gateway', 503: 'Service unavailable' };

export function htmlResponse(request, html, { funnel, v, rev, preview }) {
  const headers = {
    ...BASE,
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-cache',
    'x-ikf': `${funnel}@${v}; rev=${rev}`,
    ...(preview && { 'x-robots-tag': 'noindex' }),
  };
  return new Response(request.method === 'HEAD' ? null : html, { status: 200, headers });
}

export function errorResponse(request, status, extra = {}) {
  const body = `<!doctype html><meta charset="utf-8"><title>${TITLES[status]}</title>`;
  return new Response(request.method === 'HEAD' ? null : body, {
    status,
    headers: { ...BASE, 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...extra },
  });
}

export function log(fields) {
  console.log(JSON.stringify(fields));
}
```

`workers/edge-router/src/index.js`:

```js
import { matchRoute } from '@ikf/route-match';
import { getBundle } from './bundle.js';
import { injectIkf } from './inject.js';
import { errorResponse, htmlResponse } from './responses.js';
import { getHostRoutes } from './routes.js';

const PREVIEW_PATH = /^\/([a-z0-9][a-z0-9-]{1,62})\/v([1-9]\d{0,8})\/?$/;

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return errorResponse(request, 405, { allow: 'GET, HEAD' });
    }
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    let target;
    if (host === env.PREVIEW_HOST) {
      const m = PREVIEW_PATH.exec(url.pathname);
      if (!m) return errorResponse(request, 404);
      target = { funnel: m[1], v: Number(m[2]), rev: 0, bundle: `bundles/${m[1]}/v${m[2]}/index.html`, preview: true };
    } else {
      const doc = await getHostRoutes(env, host);
      const route = doc && matchRoute(doc.routes, url.pathname);
      if (!route) return errorResponse(request, 404);
      target = { funnel: route.funnel, v: route.v, rev: doc.rev, bundle: route.bundle, preview: false };
    }

    const html = await getBundle(env, ctx, target.bundle);
    if (html === null) return errorResponse(request, 404);
    return htmlResponse(request, injectIkf(html, target), target);
  },
};
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/edge-router`
Expected: toàn bộ PASS (`inject.test.js` 5, `router.test.js` 17).

- [ ] **Step 6: Commit**

```bash
git add workers/edge-router package.json package-lock.json
git commit -m "feat(edge-router): route host+prefix to R2 bundles with __IKF injection and previews"
```

---

### Task 11: Worker: lỗi KV, lỗi R2 và log có cấu trúc

**Files:**
- Modify: `workers/edge-router/src/index.js` (thay toàn bộ)
- Test: `workers/edge-router/test/failures.test.js`

**Interfaces:**
- Consumes: `getHostRoutes`, `RoutesUnavailableError`, `resetRouteMemory` (Task 10).
- Produces:
  - KV lỗi mà isolate còn bản route đọc được trong 10 phút → phục vụ bình thường. Không còn → `503` + `Retry-After: 5`, log `{host, path, status: 503, error: 'kv_unavailable', detail}`.
  - Route trỏ tới object R2 không tồn tại → `502`, log `{host, path, funnel, v, rev, status: 502, error: 'bundle_missing', key}`. R2 ném lỗi → `502`, log `error: 'bundle_unavailable'`. Preview thiếu object vẫn là `404`.

- [ ] **Step 1: Viết test fail**

`workers/edge-router/test/failures.test.js`:

```js
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import worker from '../src/index.js';
import { getHostRoutes, resetRouteMemory, RoutesUnavailableError } from '../src/routes.js';

const HOST = 'try.aivideo.app';
const DOC = {
  rev: 7,
  routes: [{ prefix: '/', bundle: 'bundles/aivideo/v3/index.html', funnel: 'aivideo', v: 3 }],
};
const kvDown = { ...env, ROUTES: { get: async () => { throw new Error('kv down'); } } };

async function call(url, e = env) {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(url), e, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}
const logged = (spy) => spy.mock.calls.map(([line]) => JSON.parse(line));

let logSpy;
beforeEach(async () => {
  resetRouteMemory();
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  await env.ROUTES.put(`route:${HOST}`, JSON.stringify(DOC));
  await env.BUNDLES.put('bundles/aivideo/v3/index.html', '<!doctype html><head></head>v3');
});
afterEach(() => logSpy.mockRestore());

describe('KV failures', () => {
  it('keep serving the routes this isolate last saw', async () => {
    expect((await call(`https://${HOST}/`)).status).toBe(200);
    const res = await call(`https://${HOST}/`, kvDown);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-ikf')).toBe('aivideo@3; rev=7');
  });

  it('503 with Retry-After and a structured log when nothing is remembered', async () => {
    const res = await call(`https://${HOST}/x`, kvDown);
    expect(res.status).toBe(503);
    expect(res.headers.get('retry-after')).toBe('5');
    expect(logged(logSpy)).toEqual([
      { host: HOST, path: '/x', status: 503, error: 'kv_unavailable', detail: 'kv down' },
    ]);
  });

  it('remembered routes expire after 10 minutes', async () => {
    await getHostRoutes(env, HOST, 0);
    expect(await getHostRoutes(kvDown, HOST, 10 * 60 * 1000)).toEqual(DOC);
    await expect(getHostRoutes(kvDown, HOST, 10 * 60 * 1000 + 1)).rejects.toBeInstanceOf(RoutesUnavailableError);
  });

  it('a host removed from KV is not served from memory later', async () => {
    await getHostRoutes(env, HOST, 0);
    await env.ROUTES.delete(`route:${HOST}`);
    expect(await getHostRoutes(env, HOST, 1)).toBeNull();
    await expect(getHostRoutes(kvDown, HOST, 2)).rejects.toBeInstanceOf(RoutesUnavailableError);
  });
});

describe('R2 failures', () => {
  it('502 and a structured log when the routed bundle is missing', async () => {
    await env.BUNDLES.delete('bundles/aivideo/v3/index.html');
    const res = await call(`https://${HOST}/promo`);
    expect(res.status).toBe(502);
    expect(logged(logSpy)).toEqual([
      {
        host: HOST, path: '/promo', funnel: 'aivideo', v: 3, rev: 7,
        status: 502, error: 'bundle_missing', key: 'bundles/aivideo/v3/index.html',
      },
    ]);
  });

  it('502 when R2 itself fails', async () => {
    const r2Down = { ...env, BUNDLES: { get: async () => { throw new Error('r2 down'); } } };
    const res = await call(`https://${HOST}/`, r2Down);
    expect(res.status).toBe(502);
    expect(logged(logSpy)[0]).toMatchObject({ status: 502, error: 'bundle_unavailable', detail: 'r2 down' });
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/edge-router -- test/failures.test.js`
Expected: FAIL. Test 503 nhận lỗi ném ra thay vì response, còn test 502 nhận `404`.

- [ ] **Step 3: Implement**

`workers/edge-router/src/index.js` (thay toàn bộ):

```js
import { matchRoute } from '@ikf/route-match';
import { getBundle } from './bundle.js';
import { injectIkf } from './inject.js';
import { errorResponse, htmlResponse, log } from './responses.js';
import { getHostRoutes } from './routes.js';

const PREVIEW_PATH = /^\/([a-z0-9][a-z0-9-]{1,62})\/v([1-9]\d{0,8})\/?$/;

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return errorResponse(request, 405, { allow: 'GET, HEAD' });
    }
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const path = url.pathname;

    let target;
    if (host === env.PREVIEW_HOST) {
      const m = PREVIEW_PATH.exec(path);
      if (!m) return errorResponse(request, 404);
      target = { funnel: m[1], v: Number(m[2]), rev: 0, bundle: `bundles/${m[1]}/v${m[2]}/index.html`, preview: true };
    } else {
      let doc;
      try {
        doc = await getHostRoutes(env, host);
      } catch (err) {
        log({ host, path, status: 503, error: 'kv_unavailable', detail: err.message });
        return errorResponse(request, 503, { 'retry-after': '5' });
      }
      const route = doc && matchRoute(doc.routes, path);
      if (!route) return errorResponse(request, 404);
      target = { funnel: route.funnel, v: route.v, rev: doc.rev, bundle: route.bundle, preview: false };
    }

    const where = { host, path, funnel: target.funnel, v: target.v, rev: target.rev };
    let html;
    try {
      html = await getBundle(env, ctx, target.bundle);
    } catch (err) {
      log({ ...where, status: 502, error: 'bundle_unavailable', key: target.bundle, detail: err.message });
      return errorResponse(request, 502);
    }
    if (html === null) {
      if (target.preview) return errorResponse(request, 404);
      log({ ...where, status: 502, error: 'bundle_missing', key: target.bundle });
      return errorResponse(request, 502);
    }
    return htmlResponse(request, injectIkf(html, target), target);
  },
};
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/edge-router`
Expected: toàn bộ PASS (`failures.test.js` 6, các file khác vẫn xanh).

- [ ] **Step 5: Commit**

```bash
git add workers/edge-router
git commit -m "feat(edge-router): stale-route fallback on KV outage, 502 on missing bundles, JSON logs"
```

---

### Task 12: Hạ tầng: domain funnel, preview, secrets, deploy Worker

**Files:**
- Create: `infra/modules/funnel-domains/{versions.tf,variables.tf,main.tf,outputs.tf}`
- Test: `infra/modules/funnel-domains/tests/funnel_domains.tftest.hcl`
- Modify: `infra/stack/main.tf`, `infra/stack/variables.tf`, `infra/stack/outputs.tf`, `infra/stack/tests/stack.tftest.hcl`
- Modify: `infra/envs/staging/main.tf`, `infra/envs/prod/main.tf`, `infra/envs/staging/terraform.tfvars`, `infra/envs/prod/terraform.tfvars`
- Create: `workers/edge-router/scripts/render-config.mjs`
- Create: `.github/workflows/edge-router.yml`
- Modify: `.github/workflows/infra.yml` (thêm `infra/modules/funnel-domains` vào matrix test module)
- Create: `scripts/sync-domains.sh`, `scripts/smoke-edge.sh`

**Interfaces:**
- Consumes: `module.edge.r2_bucket_name`, `module.edge.kv_namespace_id`, `var.zone_id`, `var.zone_name`, `var.cloudflare_account_id` (plan infra). Giá trị Task 0: `MEDIA_ORIGINS`, domain funnel và zone id.
- Produces:
  - Mỗi domain funnel và `preview.<zone_name>`: một bản ghi `AAAA 100::` có proxy, và Worker route `<host>/*` → `ikf-edge-router-<env>`.
  - ECS `core-api` có thêm env `CF_ACCOUNT_ID`, `R2_BUCKET`, `KV_NAMESPACE_ID`, `MEDIA_ORIGINS`, `PREVIEW_BASE_URL`.
  - Secrets mới (rỗng): `ikf/<env>/cf-kv-api-token`, `r2-access-key-id`, `r2-secret-access-key`, `bootstrap-admin-token`. Task role đọc được (qua statement `AppSecrets` sẵn có).
  - Output env: `funnel_hosts` (map host → status), `preview_host`, `worker_script_name`.
  - `scripts/sync-domains.sh <env>` (cần `IKF_API`, `IKF_ADMIN_TOKEN`) và `scripts/smoke-edge.sh <preview-host>`.

- [ ] **Step 1: Viết test fail cho module**

`infra/modules/funnel-domains/tests/funnel_domains.tftest.hcl`:

```hcl
mock_provider "cloudflare" {}

variables {
  platform_zone_id   = "zone-platform"
  platform_zone_name = "ikf-staging.example"
  worker_script_name = "ikf-edge-router-staging"
  funnel_domains = {
    "try.aivideo.app" = { zone_id = "zone-aivideo" }
    "go.calmio.app"   = { zone_id = "zone-calmio", status = "disabled" }
  }
}

run "every_host_routes_to_the_worker" {
  command = apply

  assert {
    condition     = length(cloudflare_workers_route.host) == 3
    error_message = "Two funnel hosts plus the preview host must be routed."
  }

  assert {
    condition     = alltrue([for h, r in cloudflare_workers_route.host : r.pattern == "${h}/*" && r.script == var.worker_script_name])
    error_message = "Every route must send host/* to the edge-router script."
  }

  assert {
    condition = (
      cloudflare_workers_route.host["try.aivideo.app"].zone_id == "zone-aivideo" &&
      cloudflare_workers_route.host["preview.ikf-staging.example"].zone_id == "zone-platform"
    )
    error_message = "Routes must live in the zone that holds the host."
  }
}

run "every_host_has_a_proxied_originless_record" {
  command = apply

  assert {
    condition     = alltrue([for r in cloudflare_dns_record.host : r.proxied && r.type == "AAAA" && r.content == "100::"])
    error_message = "Hosts must be proxied AAAA 100:: so only the Worker answers."
  }
}

run "disabled_domains_keep_serving_and_are_reported" {
  command = apply

  assert {
    condition     = contains(keys(cloudflare_workers_route.host), "go.calmio.app")
    error_message = "A disabled domain keeps its existing routes."
  }

  assert {
    condition     = output.funnel_hosts == { "try.aivideo.app" = "active", "go.calmio.app" = "disabled" }
    error_message = "funnel_hosts must list funnel domains (not preview) with their status."
  }

  assert {
    condition     = output.preview_host == "preview.ikf-staging.example"
    error_message = "Preview host lives under the platform zone."
  }
}

run "rejects_unknown_status" {
  command = plan

  variables {
    funnel_domains = { "x.app" = { zone_id = "z", status = "paused" } }
  }

  expect_failures = [var.funnel_domains]
}

run "rejects_uppercase_hosts" {
  command = plan

  variables {
    funnel_domains = { "Try.App" = { zone_id = "z" } }
  }

  expect_failures = [var.funnel_domains]
}
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `cd infra/modules/funnel-domains && terraform init -backend=false && terraform test`
Expected: FAIL (chưa có file `.tf`).

- [ ] **Step 3: Implement module**

`infra/modules/funnel-domains/versions.tf`:

```hcl
terraform {
  required_version = ">= 1.10.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}
```

`infra/modules/funnel-domains/variables.tf`:

```hcl
variable "platform_zone_id" {
  type = string
}

variable "platform_zone_name" {
  type = string
}

variable "worker_script_name" {
  type = string
}

variable "funnel_domains" {
  description = "Funnel host => the Cloudflare zone holding it, and whether new routes may be attached (synced to core)."
  type = map(object({
    zone_id = string
    status  = optional(string, "active")
  }))
  default = {}

  validation {
    condition     = alltrue([for h, d in var.funnel_domains : contains(["active", "disabled"], d.status)])
    error_message = "status must be \"active\" or \"disabled\"."
  }

  validation {
    condition     = alltrue([for h, d in var.funnel_domains : can(regex("^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$", h))])
    error_message = "funnel_domains keys must be lowercase hostnames."
  }
}
```

`infra/modules/funnel-domains/main.tf`:

```hcl
locals {
  hosts = merge(
    { for host, d in var.funnel_domains : host => d.zone_id },
    { "preview.${var.platform_zone_name}" = var.platform_zone_id },
  )
}

# 100:: is a discard address: nothing sits behind it, the Worker route answers every request.
resource "cloudflare_dns_record" "host" {
  for_each = local.hosts
  zone_id  = each.value
  name     = each.key
  type     = "AAAA"
  content  = "100::"
  proxied  = true
  ttl      = 1
}

resource "cloudflare_workers_route" "host" {
  for_each = local.hosts
  zone_id  = each.value
  pattern  = "${each.key}/*"
  script   = var.worker_script_name
}
```

`infra/modules/funnel-domains/outputs.tf`:

```hcl
output "funnel_hosts" {
  value = { for h, d in var.funnel_domains : h => d.status }
}

output "preview_host" {
  value = "preview.${var.platform_zone_name}"
}
```

- [ ] **Step 4: Chạy test module, xác nhận PASS**

Run: `cd infra/modules/funnel-domains && terraform test`
Expected: `5 passed, 0 failed`.

- [ ] **Step 5: Nối vào stack**

`infra/stack/variables.tf`, thêm:

```hcl
variable "media_origins" {
  description = "URL prefixes funnels may load media from (shared S3 media library)."
  type        = list(string)

  validation {
    condition     = length(var.media_origins) > 0 && alltrue([for o in var.media_origins : startswith(o, "https://")])
    error_message = "media_origins must be a non-empty list of https:// URLs."
  }
}

variable "funnel_domains" {
  type = map(object({
    zone_id = string
    status  = optional(string, "active")
  }))
  default = {}
}
```

`infra/stack/main.tf`, sửa khối `locals`:

```hcl
locals {
  api_fqdn           = "api.${var.zone_name}"
  worker_script_name = "ikf-edge-router-${var.env}"
  secret_names = [
    "paddle-api-key", "paddle-webhook-secret", "meta-capi-token", "adjust-s2s-token", "clickhouse-url",
    "cf-kv-api-token", "r2-access-key-id", "r2-secret-access-key", "bootstrap-admin-token",
  ]
}
```

Trong `module "core"`, thêm vào map `environment` (giữ các key cũ):

```hcl
    CF_ACCOUNT_ID    = var.cloudflare_account_id
    R2_BUCKET        = module.edge.r2_bucket_name
    KV_NAMESPACE_ID  = module.edge.kv_namespace_id
    MEDIA_ORIGINS    = join(",", var.media_origins)
    PREVIEW_BASE_URL = "https://${module.funnel_domains.preview_host}"
```

Thêm module mới ngay sau `module "edge"`:

```hcl
module "funnel_domains" {
  source             = "../modules/funnel-domains"
  platform_zone_id   = var.zone_id
  platform_zone_name = var.zone_name
  worker_script_name = local.worker_script_name
  funnel_domains     = var.funnel_domains
}
```

`infra/stack/outputs.tf`, thêm:

```hcl
output "funnel_hosts" {
  value = module.funnel_domains.funnel_hosts
}

output "preview_host" {
  value = module.funnel_domains.preview_host
}

output "worker_script_name" {
  value = local.worker_script_name
}
```

`infra/stack/tests/stack.tftest.hcl`: thêm `media_origins = ["https://media.ikf-staging.example/funnels/"]` vào khối `variables {}` sẵn có, rồi thêm vào cuối file:

```hcl
run "publisher_wiring" {
  command = apply

  variables {
    funnel_domains = { "try.aivideo.app" = { zone_id = "zone-aivideo" } }
  }

  assert {
    condition     = alltrue([for n in ["cf-kv-api-token", "r2-access-key-id", "r2-secret-access-key", "bootstrap-admin-token"] : contains(keys(module.security.secret_arns), n)])
    error_message = "core-api needs the KV, R2 and bootstrap secrets."
  }

  assert {
    condition     = output.preview_host == "preview.${var.zone_name}" && output.worker_script_name == "ikf-edge-router-${var.env}"
    error_message = "Preview host and Worker name must follow the env naming."
  }

  assert {
    condition     = output.funnel_hosts == { "try.aivideo.app" = "active" }
    error_message = "Funnel hosts must be exported for sync-domains.sh."
  }
}

run "media_origins_must_be_https" {
  command = plan

  variables {
    media_origins = ["http://media.test/"]
  }

  expect_failures = [var.media_origins]
}
```

- [ ] **Step 6: Chạy test stack, xác nhận PASS**

Run: `cd infra/stack && terraform init -backend=false && terraform test`
Expected: các run cũ vẫn PASS, thêm `publisher_wiring` và `media_origins_must_be_https` PASS.

- [ ] **Step 7: Nối vào hai env**

Trong `infra/envs/staging/main.tf` và `infra/envs/prod/main.tf`, thêm biến:

```hcl
variable "media_origins" { type = list(string) }

variable "funnel_domains" {
  type = map(object({
    zone_id = string
    status  = optional(string, "active")
  }))
  default = {}
}
```

Thêm vào `module "stack"`:

```hcl
  media_origins  = var.media_origins
  funnel_domains = var.funnel_domains
```

Thêm output:

```hcl
output "funnel_hosts" { value = module.stack.funnel_hosts }
output "preview_host" { value = module.stack.preview_host }
output "worker_script_name" { value = module.stack.worker_script_name }
```

`infra/envs/staging/terraform.tfvars` thêm (giá trị lấy từ Task 0 Step 1–2; dòng dưới là mẫu định dạng):

```hcl
media_origins = ["https://media-staging.<media-domain>/funnels/"]
funnel_domains = {
  "try-staging.<app-domain>" = { zone_id = "<zone id của app-domain>" }
}
```

`infra/envs/prod/terraform.tfvars` thêm tương tự với giá trị prod.

Run: `for e in staging prod; do (cd infra/envs/$e && terraform init -backend=false && terraform validate); done`
Expected: `Success! The configuration is valid.` hai lần.

- [ ] **Step 8: Script sinh cấu hình deploy Worker**

`workers/edge-router/scripts/render-config.mjs`:

```js
#!/usr/bin/env node
// Prints the deploy config for one environment: node scripts/render-config.mjs > wrangler.deploy.json
import { readFileSync } from 'node:fs';

const base = JSON.parse(readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8'));
const need = ['WORKER_ENV', 'KV_NAMESPACE_ID', 'R2_BUCKET', 'PREVIEW_HOST'];
const missing = need.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`missing env: ${missing.join(', ')}`);
  process.exit(1);
}
const { WORKER_ENV, KV_NAMESPACE_ID, R2_BUCKET, PREVIEW_HOST } = process.env;

console.log(
  JSON.stringify(
    {
      ...base,
      name: `ikf-edge-router-${WORKER_ENV}`,
      workers_dev: false,
      vars: { ...base.vars, PREVIEW_HOST },
      kv_namespaces: [{ binding: 'ROUTES', id: KV_NAMESPACE_ID }],
      r2_buckets: [{ binding: 'BUNDLES', bucket_name: R2_BUCKET }],
    },
    null,
    2,
  ),
);
```

Run: `cd workers/edge-router && WORKER_ENV=staging KV_NAMESPACE_ID=abc R2_BUCKET=ikf-bundles-staging PREVIEW_HOST=preview.x node scripts/render-config.mjs`
Expected: JSON có `"name": "ikf-edge-router-staging"`, KV id `abc`, bucket `ikf-bundles-staging`. Chạy lại không có biến nào: in `missing env: WORKER_ENV, KV_NAMESPACE_ID, R2_BUCKET, PREVIEW_HOST`, exit 1.

Thêm `wrangler.deploy.json` vào `.gitignore`.

- [ ] **Step 9: Workflow deploy Worker và script kiểm tra**

`scripts/smoke-edge.sh`:

```bash
#!/usr/bin/env bash
# Usage: scripts/smoke-edge.sh <preview-host>
# The preview root never holds a funnel, so a Worker-made 404 (with nosniff) proves the route reaches edge-router.
set -euo pipefail
host="$1"
headers=$(curl -sS -o /dev/null -D - "https://$host/")
echo "$headers" | head -1 | grep -q ' 404' || { echo "expected 404 from https://$host/"; echo "$headers"; exit 1; }
echo "$headers" | grep -qi '^x-content-type-options: nosniff' || { echo "https://$host/ is not answered by edge-router"; exit 1; }
echo "edge-router answers on $host"
```

`scripts/sync-domains.sh`:

```bash
#!/usr/bin/env bash
# Usage: IKF_API=https://api.<zone> IKF_ADMIN_TOKEN=... scripts/sync-domains.sh <env>
# Run after terraform apply: copies funnel domains and their status from Terraform into core.
set -euo pipefail
env="$1"
: "${IKF_API:?}" "${IKF_ADMIN_TOKEN:?}"
hosts=$(cd "infra/envs/$env" && terraform output -json funnel_hosts | jq -r 'to_entries[] | "\(.key) \(.value)"')
while read -r host status; do
  [ -n "$host" ] || continue
  code=$(curl -sS -o /tmp/ikf-domain.json -w '%{http_code}' -X PUT "$IKF_API/v1/domains/$host" \
    -H "authorization: Bearer $IKF_ADMIN_TOKEN" -H 'content-type: application/json' \
    -d "{\"status\":\"$status\"}")
  if [ "$code" != 200 ]; then
    echo "sync $host failed: HTTP $code $(cat /tmp/ikf-domain.json)"
    exit 1
  fi
  echo "synced $host ($status)"
done <<< "$hosts"
```

```bash
chmod +x scripts/smoke-edge.sh scripts/sync-domains.sh
```

`.github/workflows/edge-router.yml`:

```yaml
name: edge-router

on:
  pull_request:
    paths: ["workers/edge-router/**", "packages/route-match/**", "package-lock.json", ".github/workflows/edge-router.yml"]
  push:
    branches: [main]
    paths: ["workers/edge-router/**", "packages/route-match/**", "package-lock.json", ".github/workflows/edge-router.yml"]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test -w @ikf/route-match -w @ikf/edge-router

  deploy:
    if: github.event_name == 'push'
    needs: test
    runs-on: ubuntu-latest
    strategy:
      max-parallel: 1
      matrix:
        env: [staging, prod]
    environment: ${{ matrix.env }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - name: Render wrangler config
        working-directory: workers/edge-router
        env:
          WORKER_ENV: ${{ matrix.env }}
          KV_NAMESPACE_ID: ${{ vars.KV_NAMESPACE_ID }}
          R2_BUCKET: ${{ vars.R2_BUCKET }}
          PREVIEW_HOST: ${{ vars.PREVIEW_HOST }}
        run: node scripts/render-config.mjs > wrangler.deploy.json
      - name: Deploy
        working-directory: workers/edge-router
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_WORKERS_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
        run: npx wrangler deploy -c wrangler.deploy.json
      - name: Smoke
        # Routes are created by Terraform after the first deploy; skip until PREVIEW_ROUTED is set.
        if: vars.PREVIEW_ROUTED == 'true'
        run: scripts/smoke-edge.sh "${{ vars.PREVIEW_HOST }}"
```

`.github/workflows/infra.yml`: thêm `infra/modules/funnel-domains` vào danh sách `matrix.dir` của job test module.

Run: `docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest`
Expected: không báo lỗi.

- [ ] **Step 10: Commit**

```bash
git add infra workers/edge-router/scripts .gitignore .github/workflows scripts
git commit -m "feat(infra): funnel domains + preview routed to edge-router; publisher env and secrets"
```

---

### Task 13: CLI `ikf`: đăng nhập, client API, lệnh `route`

**Files:**
- Create: `packages/cli/package.json`, `packages/cli/src/main.js`, `packages/cli/src/target.js`, `packages/cli/src/credentials.js`, `packages/cli/src/api.js`
- Test: `packages/cli/test/target.test.js`, `packages/cli/test/api.test.js`, `packages/cli/test/credentials.test.js`, `packages/cli/test/main.test.js`
- Create: `.github/workflows/packages.yml`

**Interfaces:**
- Consumes: `normalizePath` (Task 1). HTTP API của Task 6–7.
- Produces:
  - `parseTarget('try.x.com/TikTok-UGC/') → { host: 'try.x.com', prefix: '/tiktok-ugc' }` (không có path → `/`, bỏ `https://`). `parseVersionRef('aivideo@v3' | 'aivideo@3') → { funnel, v }`. Sai định dạng → `UsageError`.
  - `saveCredentials({ api, token }, path?)` ghi file mode `0600`; `loadCredentials(env?, path?)`: ưu tiên `IKF_API` + `IKF_TOKEN`, nếu không có thì đọc file, chưa đăng nhập → `UsageError`.
  - `createApi({ api, token }, { fetch?, retries = 3, sleep? })` → `{ publish(slug, payload, idemKey), setRoute(host, body), rollback(host, prefix), removeRoute(host, prefix), listRoutes(host), syncHost(host) }`. Lỗi → `ApiError { status, code, detail }`. Retry khi gặp 503 hoặc lỗi mạng, backoff 1s/2s/4s, **chỉ** với `publish`, `setRoute`, `listRoutes`, `syncHost`. `rollback` và `removeRoute` không bao giờ retry.
  - `run(argv, { out, err, env, deps }) → Promise<exitCode>`: 0 thành công, 1 lỗi API/kiểm tra, 2 sai cú pháp.

- [ ] **Step 1: Khởi tạo package**

```bash
mkdir -p packages/cli/src packages/cli/test
cat > packages/cli/package.json <<'EOF'
{
  "name": "@ikf/cli",
  "private": true,
  "type": "module",
  "bin": { "ikf": "src/main.js" },
  "engines": { "node": ">=22" },
  "scripts": { "test": "vitest run" },
  "dependencies": { "@ikf/route-match": "*" },
  "devDependencies": { "vitest": "~3.2.0" }
}
EOF
npm install
```

- [ ] **Step 2: Viết test fail**

`packages/cli/test/target.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { parseTarget, parseVersionRef, UsageError } from '../src/target.js';

describe('parseTarget', () => {
  it.each([
    ['try.x.com/TikTok-UGC/', { host: 'try.x.com', prefix: '/tiktok-ugc' }],
    ['try.x.com', { host: 'try.x.com', prefix: '/' }],
    ['https://Try.X.com/a/b', { host: 'try.x.com', prefix: '/a/b' }],
  ])('%s', (raw, expected) => {
    expect(parseTarget(raw)).toEqual(expected);
  });

  it.each(['localhost', '/v1', '', 'x .com/a'])('rejects %j', (raw) => {
    expect(() => parseTarget(raw)).toThrow(UsageError);
  });
});

describe('parseVersionRef', () => {
  it('accepts funnel@vN and funnel@N', () => {
    expect(parseVersionRef('aivideo@v3')).toEqual({ funnel: 'aivideo', v: 3 });
    expect(parseVersionRef('aivideo@12')).toEqual({ funnel: 'aivideo', v: 12 });
  });

  it.each(['aivideo', 'aivideo@v0', 'Ai@v1', '@v1'])('rejects %j', (raw) => {
    expect(() => parseVersionRef(raw)).toThrow(UsageError);
  });
});
```

`packages/cli/test/credentials.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { mkdtemp, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadCredentials, saveCredentials } from '../src/credentials.js';
import { UsageError } from '../src/target.js';

describe('credentials', () => {
  it('saves with mode 0600 and loads back', async () => {
    const path = join(await mkdtemp(join(tmpdir(), 'ikf-')), 'cfg', 'credentials');
    await saveCredentials({ api: 'https://api.x', token: 'ikf_t' }, path);
    expect((await stat(path)).mode & 0o777).toBe(0o600);
    expect(await loadCredentials({}, path)).toEqual({ api: 'https://api.x', token: 'ikf_t' });
  });

  it('prefers IKF_API and IKF_TOKEN from the environment', async () => {
    expect(await loadCredentials({ IKF_API: 'https://e', IKF_TOKEN: 'ikf_e' }, '/nonexistent')).toEqual({
      api: 'https://e',
      token: 'ikf_e',
    });
  });

  it('asks to log in when nothing is configured', async () => {
    await expect(loadCredentials({}, '/nonexistent/credentials')).rejects.toThrow(UsageError);
  });
});
```

`packages/cli/test/api.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { createApi, ApiError } from '../src/api.js';

function harness(responses) {
  const calls = [];
  const sleeps = [];
  const fetch = async (url, init) => {
    calls.push({ url, init });
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return new Response(JSON.stringify(next.body ?? {}), { status: next.status });
  };
  const api = createApi({ api: 'https://api.x/', token: 'ikf_t' }, { fetch, sleep: async (ms) => sleeps.push(ms) });
  return { api, calls, sleeps };
}

describe('api client', () => {
  it('sends a bearer token and JSON, and returns the parsed body', async () => {
    const { api, calls } = harness([{ status: 200, body: { host: 'h', rev: 1 } }]);
    expect(await api.setRoute('h.x.com', { prefix: '/', funnel: 'a', v: 1 })).toEqual({ host: 'h', rev: 1 });
    expect(calls[0].url).toBe('https://api.x/v1/routes/h.x.com');
    expect(calls[0].init.method).toBe('PUT');
    expect(calls[0].init.headers.authorization).toBe('Bearer ikf_t');
    expect(JSON.parse(calls[0].init.body)).toEqual({ prefix: '/', funnel: 'a', v: 1 });
  });

  it('retries publish on 503 with backoff, then succeeds', async () => {
    const { api, calls, sleeps } = harness([{ status: 503 }, { status: 503 }, { status: 201, body: { v: 1 } }]);
    expect(await api.publish('a', { html: 'x' }, 'sha')).toEqual({ v: 1 });
    expect(calls).toHaveLength(3);
    expect(sleeps).toEqual([1000, 2000]);
    expect(calls[0].init.headers['idempotency-key']).toBe('sha');
  });

  it('gives up after 3 retries', async () => {
    const { api, calls } = harness([{ status: 503 }, { status: 503 }, { status: 503 }, { status: 503, body: { error: 'r2_unavailable' } }]);
    await expect(api.publish('a', {}, 'sha')).rejects.toMatchObject({ status: 503, code: 'r2_unavailable' });
    expect(calls).toHaveLength(4);
  });

  it('retries publish on network errors', async () => {
    const { api, calls } = harness([new TypeError('fetch failed'), { status: 200, body: { v: 1 } }]);
    expect(await api.publish('a', {}, 'sha')).toEqual({ v: 1 });
    expect(calls).toHaveLength(2);
  });

  it.each([
    ['rollback', (api) => api.rollback('h.x.com', '/')],
    ['removeRoute', (api) => api.removeRoute('h.x.com', '/')],
  ])('never retries %s, since a lost response may hide a success', async (_name, callIt) => {
    const { api, calls } = harness([new TypeError('fetch failed'), { status: 200 }]);
    await expect(callIt(api)).rejects.toMatchObject({ code: 'network_error' });
    expect(calls).toHaveLength(1);
  });

  it('does not retry 4xx and exposes code and detail', async () => {
    const { api, calls } = harness([{ status: 409, body: { error: 'no_previous_version', detail: { host: 'h' } } }]);
    const err = await api.rollback('h.x.com', '/').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409, code: 'no_previous_version', detail: { host: 'h' } });
    expect(calls).toHaveLength(1);
  });

  it('puts the prefix of rm in the query string', async () => {
    const { api, calls } = harness([{ status: 200 }]);
    await api.removeRoute('h.x.com', '/a/b');
    expect(calls[0].url).toBe('https://api.x/v1/routes/h.x.com?prefix=%2Fa%2Fb');
    expect(calls[0].init.method).toBe('DELETE');
  });
});
```

`packages/cli/test/main.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { run } from '../src/main.js';
import { ApiError } from '../src/api.js';

function io(api = {}) {
  const lines = [];
  const errors = [];
  const saved = [];
  return {
    lines,
    errors,
    saved,
    opts: {
      out: (l) => lines.push(l),
      err: (l) => errors.push(l),
      env: {},
      deps: { api, saveCredentials: async (c) => saved.push(c) },
    },
  };
}

const change = (extra = {}) => ({
  host: 'try.x.com', prefix: '/ugc', funnel: 'aivideo', v: 3, rev: 18, kv_sync: 'ok', propagation_seconds: 90, ...extra,
});

describe('ikf', () => {
  it('route set prints the change and the propagation delay', async () => {
    let body;
    const t = io({ setRoute: async (host, b) => { body = { host, ...b }; return change(); } });
    expect(await run(['route', 'set', 'try.x.com/UGC', 'aivideo@v3'], t.opts)).toBe(0);
    expect(body).toEqual({ host: 'try.x.com', prefix: '/ugc', funnel: 'aivideo', v: 3, confirm_funnel_change: false });
    expect(t.lines).toEqual(['try.x.com/ugc → aivideo@v3 (rev 18)', 'Có hiệu lực toàn cầu trong tối đa ~90 giây.']);
  });

  it('route set --yes confirms a funnel change', async () => {
    let body;
    const t = io({ setRoute: async (_h, b) => { body = b; return change(); } });
    await run(['route', 'set', 'try.x.com/ugc', 'other@1', '--yes'], t.opts);
    expect(body.confirm_funnel_change).toBe(true);
  });

  it('warns loudly when the change has not reached the edge', async () => {
    const t = io({ setRoute: async () => change({ kv_sync: 'pending' }) });
    await run(['route', 'set', 'try.x.com/ugc', 'aivideo@v3'], t.opts);
    expect(t.lines[1]).toBe(
      'CẢNH BÁO: đã lưu nhưng CHƯA lên edge (KV lỗi). Hệ thống tự thử lại mỗi phút, hoặc chạy: ikf route sync try.x.com',
    );
  });

  it('explains how to confirm when the route points at another funnel', async () => {
    const t = io({
      setRoute: async () => {
        throw new ApiError(409, { error: 'funnel_change_requires_confirmation', detail: { from: 'aivideo', to: 'other' } });
      },
    });
    expect(await run(['route', 'set', 'try.x.com/ugc', 'other@v1'], t.opts)).toBe(1);
    expect(t.errors).toEqual(['Route đang trỏ tới funnel "aivideo". Chạy lại với --yes để chuyển sang "other".']);
  });

  it('route rollback and rm print what changed', async () => {
    const t = io({ rollback: async () => change({ v: 2 }), removeRoute: async () => change() });
    await run(['route', 'rollback', 'try.x.com/ugc'], t.opts);
    await run(['route', 'rm', 'try.x.com/ugc'], t.opts);
    expect(t.lines[0]).toBe('try.x.com/ugc → aivideo@v2 (rev 18)');
    expect(t.lines[2]).toBe('try.x.com/ugc đã gỡ (trước đó: aivideo@v3, rev 18)');
  });

  it('route ls lists routes and flags a lagging KV', async () => {
    const t = io({
      listRoutes: async () => ({
        host: 'try.x.com', status: 'active', rev: 5, kv_synced_rev: 4,
        routes: [{ prefix: '/ugc', funnel: 'aivideo', v: 3, updated_by: 'thinh', updated_at: '2026-10-06T10:00:00.000Z' }],
      }),
    });
    await run(['route', 'ls', 'try.x.com'], t.opts);
    expect(t.lines[0]).toBe('try.x.com (active) rev 5, KV rev 4');
    expect(t.lines[1]).toBe('CẢNH BÁO: KV đang chậm hơn DB; chạy: ikf route sync try.x.com');
    expect(t.lines[2]).toMatch(/^ {2}\/ugc +aivideo@v3 +thinh {2}2026-10-06T10:00:00.000Z$/);
  });

  it('prints validation errors one url per line', async () => {
    const t = io({
      setRoute: async () => {
        throw new ApiError(422, {
          error: 'media_origin_not_allowed',
          detail: [{ code: 'media_origin_not_allowed', detail: { urls: ['img/a.jpg', 'img/b.jpg'] } }],
        });
      },
    });
    await run(['route', 'set', 'try.x.com', 'a@v1'], t.opts);
    expect(t.errors[0]).toBe('Lỗi 422 media_origin_not_allowed\n  media_origin_not_allowed:\n    img/a.jpg\n    img/b.jpg');
  });

  it('login stores credentials', async () => {
    const t = io();
    expect(await run(['login', '--api', 'https://api.x', '--token', 'ikf_t'], t.opts)).toBe(0);
    expect(t.saved).toEqual([{ api: 'https://api.x', token: 'ikf_t' }]);
  });

  it('exits 2 with usage for unknown commands', async () => {
    const t = io();
    expect(await run(['fly'], t.opts)).toBe(2);
    expect(t.errors[0]).toContain('ikf route set');
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/cli`
Expected: FAIL với `Failed to load url ../src/target.js` (và các file khác).

- [ ] **Step 4: Implement**

`packages/cli/src/target.js`:

```js
import { normalizePath } from '@ikf/route-match';

export class UsageError extends Error {}

const HOST_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

export function parseTarget(raw) {
  const s = String(raw).replace(/^https?:\/\//i, '');
  const slash = s.indexOf('/');
  const host = (slash === -1 ? s : s.slice(0, slash)).toLowerCase();
  if (!HOST_RE.test(host)) throw new UsageError(`không đọc được host trong "${raw}" (ví dụ: try.x.com/tiktok-ugc)`);
  return { host, prefix: normalizePath(slash === -1 ? '/' : s.slice(slash)) };
}

export function parseVersionRef(raw) {
  const m = /^([a-z0-9][a-z0-9-]{1,62})@v?([1-9]\d*)$/.exec(String(raw));
  if (!m) throw new UsageError(`cần dạng <funnel>@v<n>, nhận được "${raw}"`);
  return { funnel: m[1], v: Number(m[2]) };
}
```

`packages/cli/src/credentials.js`:

```js
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { UsageError } from './target.js';

export const credentialsPath = () => join(homedir(), '.config', 'ikf', 'credentials');

export async function saveCredentials({ api, token }, path = credentialsPath()) {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  await writeFile(path, JSON.stringify({ api, token }, null, 2), { mode: 0o600 });
  await chmod(path, 0o600);
}

export async function loadCredentials(env = process.env, path = credentialsPath()) {
  if (env.IKF_API && env.IKF_TOKEN) return { api: env.IKF_API, token: env.IKF_TOKEN };
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    throw new UsageError('chưa đăng nhập: chạy `ikf login --api <url> --token <token>`');
  }
}
```

`packages/cli/src/api.js`:

```js
export class ApiError extends Error {
  constructor(status, body = {}) {
    super(body.error ?? `HTTP ${status}`);
    this.status = status;
    this.code = body.error ?? 'http_error';
    this.detail = body.detail;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createApi({ api, token }, { fetch: doFetch = fetch, retries = 3, sleep = wait } = {}) {
  const base = api.replace(/\/+$/, '');

  async function call(method, path, { body, headers = {}, retry }) {
    for (let attempt = 0; ; attempt += 1) {
      const canRetry = retry && attempt < retries;
      let res;
      try {
        res = await doFetch(base + path, {
          method,
          headers: {
            authorization: `Bearer ${token}`,
            ...(body !== undefined && { 'content-type': 'application/json' }),
            ...headers,
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        });
      } catch (err) {
        if (canRetry) {
          await sleep(1000 * 2 ** attempt);
          continue;
        }
        throw new ApiError(0, { error: 'network_error', detail: err.message });
      }
      if (res.status === 503 && canRetry) {
        await sleep(1000 * 2 ** attempt);
        continue;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new ApiError(res.status, data);
      return data;
    }
  }

  const q = encodeURIComponent;
  return {
    // Safe to retry: publish dedupes on sha256, set to the same version is a no-op.
    publish: (slug, payload, idemKey) =>
      call('POST', `/v1/funnels/${slug}/versions`, { body: payload, headers: { 'idempotency-key': idemKey }, retry: true }),
    setRoute: (host, body) => call('PUT', `/v1/routes/${host}`, { body, retry: true }),
    listRoutes: (host) => call('GET', `/v1/routes/${host}`, { retry: true }),
    syncHost: (host) => call('POST', `/v1/routes/${host}/sync`, { retry: true }),
    // Never retried: if the first call succeeded but the reply was lost, a retry would roll back twice.
    rollback: (host, prefix) => call('POST', `/v1/routes/${host}/rollback`, { body: { prefix }, retry: false }),
    removeRoute: (host, prefix) => call('DELETE', `/v1/routes/${host}?prefix=${q(prefix)}`, { retry: false }),
  };
}
```

`packages/cli/src/main.js`:

```js
#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { ApiError, createApi } from './api.js';
import { loadCredentials, saveCredentials } from './credentials.js';
import { parseTarget, parseVersionRef, UsageError } from './target.js';

const USAGE = `Cách dùng:
  ikf login --api <url> --token <token>
  ikf publish <folder> --slug <slug>
  ikf route set <host>[/prefix] <funnel>@v<n> [--yes]
  ikf route rollback <host>[/prefix]
  ikf route rm <host>[/prefix]
  ikf route ls <host>
  ikf route sync <host>`;

const where = (r) => `${r.host}${r.prefix === '/' ? '/' : r.prefix}`;

function printChange(out, r) {
  out(`${where(r)} → ${r.funnel}@v${r.v} (rev ${r.rev})`);
  if (r.kv_sync === 'pending') {
    out(`CẢNH BÁO: đã lưu nhưng CHƯA lên edge (KV lỗi). Hệ thống tự thử lại mỗi phút, hoặc chạy: ikf route sync ${r.host}`);
  } else {
    out(`Có hiệu lực toàn cầu trong tối đa ~${r.propagation_seconds} giây.`);
  }
}

function printList(out, r) {
  out(`${r.host} (${r.status}) rev ${r.rev}, KV rev ${r.kv_synced_rev}`);
  if (r.kv_synced_rev < r.rev) out(`CẢNH BÁO: KV đang chậm hơn DB; chạy: ikf route sync ${r.host}`);
  if (!r.routes.length) out('  (chưa có route)');
  for (const x of r.routes) {
    out(`  ${x.prefix.padEnd(24)} ${`${x.funnel}@v${x.v}`.padEnd(24)} ${x.updated_by}  ${x.updated_at}`);
  }
}

export function formatApiError(e) {
  if (e.code === 'funnel_change_requires_confirmation') {
    return `Route đang trỏ tới funnel "${e.detail.from}". Chạy lại với --yes để chuyển sang "${e.detail.to}".`;
  }
  const lines = [`Lỗi ${e.status || ''} ${e.code}`.replace('  ', ' ')];
  const details = Array.isArray(e.detail) ? e.detail : e.detail === undefined ? [] : [e.detail];
  for (const d of details) {
    if (d?.code && Array.isArray(d.detail?.urls)) lines.push(`  ${d.code}:`, ...d.detail.urls.map((u) => `    ${u}`));
    else lines.push(`  ${JSON.stringify(d)}`);
  }
  return lines.join('\n');
}

async function routeCommand(api, sub, args, values, out) {
  const target = () => {
    if (!args[0]) throw new UsageError(USAGE);
    return parseTarget(args[0]);
  };
  switch (sub) {
    case 'set': {
      const { host, prefix } = target();
      if (!args[1]) throw new UsageError(USAGE);
      const { funnel, v } = parseVersionRef(args[1]);
      printChange(out, await api.setRoute(host, { prefix, funnel, v, confirm_funnel_change: values.yes }));
      return 0;
    }
    case 'rollback': {
      const { host, prefix } = target();
      printChange(out, await api.rollback(host, prefix));
      return 0;
    }
    case 'rm': {
      const { host, prefix } = target();
      const r = await api.removeRoute(host, prefix);
      out(`${where(r)} đã gỡ (trước đó: ${r.funnel}@v${r.v}, rev ${r.rev})`);
      return 0;
    }
    case 'ls': {
      printList(out, await api.listRoutes(target().host));
      return 0;
    }
    case 'sync': {
      const r = await api.syncHost(target().host);
      out(`${r.host}: KV đã đồng bộ (rev ${r.rev}).`);
      return 0;
    }
    default:
      throw new UsageError(USAGE);
  }
}

export async function run(argv, { out = console.log, err = console.error, env = process.env, deps = {} } = {}) {
  try {
    const { positionals, values } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        api: { type: 'string' },
        token: { type: 'string' },
        slug: { type: 'string' },
        yes: { type: 'boolean', default: false },
      },
    });
    const [cmd, sub, ...rest] = positionals;
    if (cmd === 'login') {
      if (!values.api || !values.token) throw new UsageError(USAGE);
      await (deps.saveCredentials ?? saveCredentials)({ api: values.api, token: values.token });
      out('Đã lưu thông tin đăng nhập.');
      return 0;
    }
    if (cmd !== 'route') throw new UsageError(USAGE);
    const api = deps.api ?? createApi(await loadCredentials(env));
    return await routeCommand(api, sub, rest, values, out);
  } catch (e) {
    if (e instanceof UsageError) {
      err(e.message);
      return 2;
    }
    if (e instanceof ApiError) {
      err(formatApiError(e));
      return 1;
    }
    if (e.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION') {
      err(`${e.message}\n${USAGE}`);
      return 2;
    }
    throw e;
  }
}

if (realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await run(process.argv.slice(2));
}
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/cli`
Expected: toàn bộ PASS.

- [ ] **Step 6: Workflow test cho package**

`.github/workflows/packages.yml`:

```yaml
name: packages

on:
  pull_request:
    paths: ["packages/**", "package-lock.json", ".github/workflows/packages.yml"]
  push:
    branches: [main]
    paths: ["packages/**", "package-lock.json", ".github/workflows/packages.yml"]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test -w @ikf/route-match -w @ikf/cli
```

Run: `docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest`
Expected: không báo lỗi.

- [ ] **Step 7: Commit**

```bash
git add packages/cli package.json package-lock.json .github/workflows/packages.yml
git commit -m "feat(cli): ikf login and route set/rollback/rm/ls/sync with safe retries"
```

---

### Task 14: CLI `ikf publish`: lint + smoke local rồi gửi lên

**Files:**
- Create: `packages/cli/src/checks.js`, `packages/cli/src/publish.js`
- Modify: `packages/cli/src/main.js` (thêm nhánh `publish`)
- Test: `packages/cli/test/checks.test.js`, `packages/cli/test/publish.test.js`

**Interfaces:**
- Consumes: `createApi().publish` (Task 13), `funnel/tools/lint_funnel.py` và `funnel/tools/smoke_demo.mjs` (repo `ikame`). Smoke cần `npm ci` trong `funnel/tools` để có Playwright.
- Produces:
  - `findToolsDir(start, env?)`: dùng `IKF_TOOLS_DIR` nếu có, nếu không thì đi ngược lên từ folder funnel tìm `funnel/tools/smoke_demo.mjs`. Không thấy → `UsageError`.
  - `screensFromContent(md)`: đọc `screens: N` trong frontmatter.
  - `runLocalChecks({ folder, html, tools, runner? }) → { lint: 'pass', smoke: 'pass', screens }`:
    - Chạy `python3 lint_funnel.py <folder>/funnel-content.md`.
    - Chép `html` ra một thư mục tạm **không có `img/`**, rồi chạy `node smoke_demo.mjs <tmp>/demo.html <screens>` (không có `--allow-price-tokens`). Xóa thư mục tạm sau khi chạy.
    - Lỗi → `CheckFailedError { stage: 'lint'|'smoke', output }`.
  - `publishCommand({ api, folder, slug, out, runner?, env? })`.
  - `ikf publish <folder> --slug <slug>`: exit 0 khi thành công, 1 khi lint/smoke/API lỗi, 2 khi thiếu tham số.

- [ ] **Step 1: Viết test fail**

`packages/cli/test/checks.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { mkdir, mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { CheckFailedError, findToolsDir, runLocalChecks, screensFromContent } from '../src/checks.js';
import { UsageError } from '../src/target.js';

const MD = '---\nniche: x\nscreens: 12\n---\n### 1. Hook\n';

let root;
let folder;
let tools;
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'ikf-repo-'));
  tools = join(root, 'funnel', 'tools');
  folder = join(root, 'funnel', 'funnel-development', 'ai-photo-video', 'aivideo');
  await mkdir(tools, { recursive: true });
  await mkdir(join(folder, 'img'), { recursive: true });
  await writeFile(join(tools, 'smoke_demo.mjs'), '');
  await writeFile(join(folder, 'funnel-content.md'), MD);
});

function recorder(results = {}) {
  const calls = [];
  const runner = async (cmd, args, opts) => {
    const smokeDir = cmd === 'node' ? dirname(args[1]) : null;
    calls.push({
      cmd,
      args,
      opts,
      smokeDirFiles: smokeDir ? await readdir(smokeDir) : null,
      smokeHtml: smokeDir ? await readFile(args[1], 'utf8') : null,
    });
    return results[cmd] ?? { code: 0, output: 'ok' };
  };
  return { calls, runner };
}

describe('findToolsDir', () => {
  it('walks up from the funnel folder to funnel/tools', async () => {
    expect(await findToolsDir(folder, {})).toBe(tools);
  });

  it('honours IKF_TOOLS_DIR', async () => {
    expect(await findToolsDir(folder, { IKF_TOOLS_DIR: '/opt/tools' })).toBe('/opt/tools');
  });

  it('fails clearly outside the ikame repo', async () => {
    await expect(findToolsDir(tmpdir(), {})).rejects.toThrow(UsageError);
  });
});

describe('screensFromContent', () => {
  it('reads screens from the frontmatter', () => {
    expect(screensFromContent(MD)).toBe(12);
  });

  it('fails without a screens line', () => {
    expect(() => screensFromContent('---\nniche: x\n---\n')).toThrow(UsageError);
  });
});

describe('runLocalChecks', () => {
  it('lints the content brief, then smokes a lone copy of the html without img/', async () => {
    const { calls, runner } = recorder();
    const report = await runLocalChecks({ folder, html: '<html>demo</html>', tools, runner });
    expect(report).toEqual({ lint: 'pass', smoke: 'pass', screens: 12 });
    expect(calls[0]).toMatchObject({
      cmd: 'python3',
      args: [join(tools, 'lint_funnel.py'), join(folder, 'funnel-content.md')],
      opts: { cwd: tools },
    });
    expect(calls[1]).toMatchObject({ cmd: 'node', opts: { cwd: tools } });
    expect(calls[1].args[0]).toBe(join(tools, 'smoke_demo.mjs'));
    expect(calls[1].args[2]).toBe('12');
    expect(calls[1].args).not.toContain('--allow-price-tokens');
    expect(dirname(calls[1].args[1])).not.toBe(folder);
    expect(calls[1].smokeDirFiles).toEqual(['demo.html']);
    expect(calls[1].smokeHtml).toBe('<html>demo</html>');
    expect(existsSync(dirname(calls[1].args[1]))).toBe(false);
  });

  it('stops at lint and does not smoke', async () => {
    const { calls, runner } = recorder({ python3: { code: 1, output: 'frontmatter missing niche' } });
    const err = await runLocalChecks({ folder, html: 'x', tools, runner }).catch((e) => e);
    expect(err).toBeInstanceOf(CheckFailedError);
    expect(err).toMatchObject({ stage: 'lint', output: 'frontmatter missing niche' });
    expect(calls).toHaveLength(1);
  });

  it('reports smoke failures and still removes the temp dir', async () => {
    const { calls, runner } = recorder({ node: { code: 1, output: 'requestfailed: file:///tmp/x/img/a.jpg' } });
    const err = await runLocalChecks({ folder, html: 'x', tools, runner }).catch((e) => e);
    expect(err).toMatchObject({ stage: 'smoke' });
    expect(existsSync(dirname(calls[1].args[1]))).toBe(false);
  });

  it('requires funnel-content.md', async () => {
    const { runner } = recorder();
    await expect(runLocalChecks({ folder: tools, html: 'x', tools, runner })).rejects.toThrow(UsageError);
  });
});
```

`packages/cli/test/publish.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run } from '../src/main.js';

async function funnelFolder(html) {
  const root = await mkdtemp(join(tmpdir(), 'ikf-pub-'));
  const tools = join(root, 'funnel', 'tools');
  const folder = join(root, 'funnel', 'funnel-development', 'app', 'aivideo');
  await mkdir(tools, { recursive: true });
  await mkdir(folder, { recursive: true });
  await writeFile(join(tools, 'smoke_demo.mjs'), '');
  await writeFile(join(folder, 'demo.html'), html);
  await writeFile(join(folder, 'funnel-content.md'), '---\nscreens: 3\n---\n');
  return folder;
}

describe('ikf publish', () => {
  it('runs local checks, posts the html with its sha256 and prints the preview', async () => {
    const html = "<script>const CONFIG={funnel:'aivideo'}</script>";
    const folder = await funnelFolder(html);
    const sent = [];
    const lines = [];
    const code = await run(['publish', folder, '--slug', 'aivideo'], {
      out: (l) => lines.push(l),
      err: () => {},
      env: {},
      deps: {
        runner: async () => ({ code: 0, output: '' }),
        api: {
          publish: async (slug, payload, key) => {
            sent.push({ slug, payload, key });
            return { funnel: 'aivideo', v: 4, created: true, preview_url: 'https://preview.x/aivideo/v4' };
          },
        },
      },
    });
    const sha = createHash('sha256').update(html).digest('hex');
    expect(code).toBe(0);
    expect(sent).toEqual([
      { slug: 'aivideo', payload: { html, sha256: sha, lint_report: { lint: 'pass', smoke: 'pass', screens: 3 } }, key: sha },
    ]);
    expect(lines.slice(-3)).toEqual([
      'aivideo@v4',
      'Preview: https://preview.x/aivideo/v4',
      'Gắn vào traffic: ikf route set <host>/<path> aivideo@v4',
    ]);
  });

  it('says when nothing changed', async () => {
    const folder = await funnelFolder('x');
    const lines = [];
    await run(['publish', folder, '--slug', 'aivideo'], {
      out: (l) => lines.push(l),
      env: {},
      deps: {
        runner: async () => ({ code: 0, output: '' }),
        api: { publish: async () => ({ funnel: 'aivideo', v: 2, created: false, preview_url: 'p' }) },
      },
    });
    expect(lines).toContain('aivideo@v2 (nội dung không đổi, dùng lại version cũ)');
  });

  it('exits 1 with the tool output when smoke fails, without calling the API', async () => {
    const folder = await funnelFolder('x');
    const errors = [];
    let called = false;
    const code = await run(['publish', folder, '--slug', 'aivideo'], {
      out: () => {},
      err: (l) => errors.push(l),
      env: {},
      deps: {
        runner: async (cmd) => (cmd === 'node' ? { code: 1, output: 'blank screen 3' } : { code: 0, output: '' }),
        api: { publish: async () => { called = true; } },
      },
    });
    expect(code).toBe(1);
    expect(called).toBe(false);
    expect(errors).toEqual(['smoke fail:\nblank screen 3']);
  });

  it('exits 2 without --slug', async () => {
    const errors = [];
    expect(await run(['publish', '/tmp'], { err: (l) => errors.push(l), env: {}, deps: { api: {} } })).toBe(2);
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `npm test -w @ikf/cli`
Expected: FAIL với `Failed to load url ../src/checks.js`; test publish trả exit 2 (lệnh `publish` chưa có).

- [ ] **Step 3: Implement**

`packages/cli/src/checks.js`:

```js
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { UsageError } from './target.js';

export class CheckFailedError extends Error {
  constructor(stage, output) {
    super(`${stage} failed`);
    this.stage = stage;
    this.output = output;
  }
}

export async function findToolsDir(start, env = process.env) {
  if (env.IKF_TOOLS_DIR) return env.IKF_TOOLS_DIR;
  let dir = resolve(start);
  for (;;) {
    const candidate = join(dir, 'funnel', 'tools');
    if (existsSync(join(candidate, 'smoke_demo.mjs'))) return candidate;
    const parent = dirname(dir);
    if (parent === dir) throw new UsageError('không tìm thấy funnel/tools (chạy trong repo ikame hoặc đặt IKF_TOOLS_DIR)');
    dir = parent;
  }
}

export function screensFromContent(md) {
  const m = /^screens:\s*(\d+)\s*$/m.exec(md);
  if (!m) throw new UsageError('funnel-content.md thiếu dòng `screens: N` trong frontmatter');
  return Number(m[1]);
}

export function defaultRunner(cmd, args, { cwd }) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', (d) => { output += d; });
    child.stderr.on('data', (d) => { output += d; });
    child.on('error', reject);
    child.on('close', (code) => resolvePromise({ code, output: output.trim() }));
  });
}

export async function runLocalChecks({ folder, html, tools, runner = defaultRunner }) {
  const contentPath = join(folder, 'funnel-content.md');
  let md;
  try {
    md = await readFile(contentPath, 'utf8');
  } catch {
    throw new UsageError(`thiếu ${contentPath}`);
  }
  const screens = screensFromContent(md);

  const lint = await runner('python3', [join(tools, 'lint_funnel.py'), contentPath], { cwd: tools });
  if (lint.code !== 0) throw new CheckFailedError('lint', lint.output);

  // Smoke a lone copy: with no img/ beside it, any image the IMG map does not resolve
  // to a real URL fails to load, exactly as it would on the edge.
  const dir = await mkdtemp(join(tmpdir(), 'ikf-smoke-'));
  try {
    const page = join(dir, 'demo.html');
    await writeFile(page, html);
    const smoke = await runner('node', [join(tools, 'smoke_demo.mjs'), page, String(screens)], { cwd: tools });
    if (smoke.code !== 0) throw new CheckFailedError('smoke', smoke.output);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  return { lint: 'pass', smoke: 'pass', screens };
}
```

`packages/cli/src/publish.js`:

```js
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { findToolsDir, runLocalChecks } from './checks.js';
import { UsageError } from './target.js';

export async function publishCommand({ api, folder, slug, out, runner, env = process.env }) {
  if (!folder || !slug) throw new UsageError('cách dùng: ikf publish <folder> --slug <slug>');
  const demoPath = join(folder, 'demo.html');
  let html;
  try {
    html = await readFile(demoPath, 'utf8');
  } catch {
    throw new UsageError(`không tìm thấy ${demoPath}`);
  }
  const tools = await findToolsDir(folder, env);
  out('Đang chạy lint + smoke...');
  const lintReport = await runLocalChecks({ folder, html, tools, runner });
  const sha256 = createHash('sha256').update(html).digest('hex');
  const res = await api.publish(slug, { html, sha256, lint_report: lintReport }, sha256);
  out(`${res.funnel}@v${res.v}${res.created ? '' : ' (nội dung không đổi, dùng lại version cũ)'}`);
  out(`Preview: ${res.preview_url}`);
  out(`Gắn vào traffic: ikf route set <host>/<path> ${res.funnel}@v${res.v}`);
  return res;
}
```

`packages/cli/src/main.js`: thêm import:

```js
import { CheckFailedError } from './checks.js';
import { publishCommand } from './publish.js';
```

Thay hai dòng:

```js
    if (cmd !== 'route') throw new UsageError(USAGE);
    const api = deps.api ?? createApi(await loadCredentials(env));
    return await routeCommand(api, sub, rest, values, out);
```

bằng:

```js
    if (cmd !== 'route' && cmd !== 'publish') throw new UsageError(USAGE);
    if (cmd === 'publish' && (!sub || !values.slug)) throw new UsageError('cách dùng: ikf publish <folder> --slug <slug>');
    const api = deps.api ?? createApi(await loadCredentials(env));
    if (cmd === 'publish') {
      await publishCommand({ api, folder: sub, slug: values.slug, out, runner: deps.runner, env });
      return 0;
    }
    return await routeCommand(api, sub, rest, values, out);
```

Trong khối `catch`, thêm trước nhánh `ApiError`:

```js
    if (e instanceof CheckFailedError) {
      err(`${e.stage} fail:\n${e.output}`);
      return 1;
    }
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `npm test -w @ikf/cli`
Expected: toàn bộ PASS.

- [ ] **Step 5: Chạy thật lint + smoke trên một funnel (chưa gửi API)**

Run:
```bash
cd /Users/daothinh/ikame/funnel/tools && npm ci && npx playwright install chromium
cd /Users/daothinh/ikf-platform
node -e "
import('./packages/cli/src/checks.js').then(async ({ runLocalChecks, findToolsDir }) => {
  const fs = await import('node:fs/promises');
  const folder = '/Users/daothinh/ikame/funnel/funnel-development/ai-photo-video/ai-video-generator';
  const html = await fs.readFile(folder + '/demo.html', 'utf8');
  try { console.log(await runLocalChecks({ folder, html, tools: await findToolsDir(folder) })); }
  catch (e) { console.log(e.stage, '\n' + e.output); }
});"
```
Expected: funnel này vẫn tham chiếu `img/...` tương đối, nên smoke phải **fail** với `requestfailed: file://.../img/...`. Điều đó chứng minh kiểm tra R1 hoạt động. Nếu smoke pass thì nghĩa là ảnh không được kiểm tra: dừng lại, xem lại `runLocalChecks`.

- [ ] **Step 6: Commit**

```bash
git add packages/cli
git commit -m "feat(cli): ikf publish runs lint and an img-less smoke before uploading"
```

---

### Task 15: Dựng staging → E2E → rollback drill → load test → prod

Ai làm: DevOps + QA + người làm funnel. Cần Task 0 xong và plan infra đã apply (stack có R2, KV, ECS, RDS).

**Files:**
- Create: `scripts/measure-propagation.sh`, `loadtest/edge-router.js`

- [ ] **Step 1: Script đo thời gian lan route**

`scripts/measure-propagation.sh`:

```bash
#!/usr/bin/env bash
# Usage: scripts/measure-propagation.sh <url> <expected x-ikf prefix, e.g. aivideo@3>
# Polls every 5s from this machine's Cloudflare PoP until x-ikf starts with the expected value.
set -euo pipefail
url="$1"
want="$2"
start=$(date +%s)
while true; do
  got=$(curl -sS -o /dev/null -D - "$url" | awk -F': ' 'tolower($1) == "x-ikf" { print $2 }' | tr -d '\r')
  now=$(date +%s)
  if [[ "$got" == "$want"* ]]; then
    echo "propagated in $((now - start))s ($got)"
    exit 0
  fi
  if (( now - start > 300 )); then
    echo "not propagated after 300s (last: ${got:-none})"
    exit 1
  fi
  sleep 5
done
```

`loadtest/edge-router.js`:

```js
// k6 run -e TARGET_URL=https://<funnel host>/<path> loadtest/edge-router.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    peak10x: {
      executor: 'constant-arrival-rate',
      rate: 400,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 200,
      maxVUs: 800,
    },
  },
  thresholds: {
    http_req_failed: ['rate==0'],
    http_req_waiting: ['p(95)<200'],
  },
};

export default function () {
  // A different fbclid per request, as from real ads; must not defeat the bundle cache.
  const res = http.get(`${__ENV.TARGET_URL}?fbclid=k6-${__VU}-${__ITER}`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'served by edge-router': (r) => (r.headers['X-Ikf'] || '').length > 0,
  });
}
```

```bash
chmod +x scripts/measure-propagation.sh
git add scripts/measure-propagation.sh loadtest/edge-router.js
git commit -m "test(edge-router): propagation probe and 10x peak load test"
```

- [ ] **Step 2: Deploy Worker staging (trước khi Terraform tạo route)**

Tạo biến cho GitHub environment `staging` từ output Terraform đang có:

```bash
cd infra/envs/staging
gh variable set KV_NAMESPACE_ID --env staging --body "$(terraform output -raw kv_namespace_id)"
gh variable set R2_BUCKET --env staging --body "$(terraform output -raw r2_bucket_name)"
gh variable set PREVIEW_HOST --env staging --body "preview.$TF_VAR_zone_name"
gh variable set CLOUDFLARE_ACCOUNT_ID --env staging --body "$TF_VAR_cloudflare_account_id"
```

Merge Task 10–12 vào `main`. Expected: workflow `edge-router` chạy xong job `deploy (staging)`, và Cloudflare dashboard có Worker `ikf-edge-router-staging`.

- [ ] **Step 3: Apply Terraform staging và nhập secrets**

```bash
cd infra/envs/staging && terraform plan -out tfplan && terraform apply tfplan
```
Expected: plan chỉ thêm DNS + Worker route cho domain funnel và `preview.<zone>`, 4 secret mới, và sửa task definition `core-api` (env mới). Không có destroy.

Nhập giá trị secrets theo Task 0 Step 5–7 (`aws secretsmanager put-secret-value --secret-id ikf/staging/<name> --secret-string ...`) cho `cf-kv-api-token`, `r2-access-key-id`, `r2-secret-access-key`, `bootstrap-admin-token`.

Run: `gh variable set PREVIEW_ROUTED --env staging --body true && scripts/smoke-edge.sh "preview.$TF_VAR_zone_name"`
Expected: `edge-router answers on preview.<zone>`.

- [ ] **Step 4: Deploy core-api và đồng bộ domain**

Merge Task 1–9 (nếu chưa) để workflow `core-api` deploy image mới. Phải apply Terraform (Step 3) **trước**: `deploy-core-api.sh` lấy revision mới nhất của task family, nên chỉ revision do Terraform vừa tạo mới có các biến env mới.

Run: `curl -sS https://api.$TF_VAR_zone_name/healthz`
Expected: `{"status":"ok",...}`. Log ECS không có `missing secret values`.

```bash
export IKF_API=https://api.$TF_VAR_zone_name IKF_ADMIN_TOKEN=<bootstrap-admin-token>
scripts/sync-domains.sh staging
```
Expected: `synced <host> (active)` cho từng domain funnel.

- [ ] **Step 5: Cấp token cho người dùng**

```bash
curl -sS -X POST "$IKF_API/v1/tokens" -H "authorization: Bearer $IKF_ADMIN_TOKEN" \
  -H 'content-type: application/json' -d '{"name":"<tên người>","roles":["publisher","router"]}'
```
Expected: `201`, có `token` dạng `ikf_...`. Gửi token qua password manager. Người đó chạy `ikf login --api $IKF_API --token <token>` (CLI cài bằng `npm link -w @ikf/cli` từ repo `ikf-platform`).

- [ ] **Step 6: Rà toàn bộ funnel bằng validator**

Run: `node services/core-api/scripts/validate-all.js /Users/daothinh/ikame/funnel/funnel-development --media-origin <MEDIA_ORIGINS staging>`
Expected: danh sách funnel cần sửa (ảnh chưa đổi sang URL thư viện, thiếu `CONFIG.funnel`). Gửi danh sách cho team nội dung. Không có lỗi nào khác hai loại này.

- [ ] **Step 7: E2E trên một funnel pilot**

Team nội dung đổi map `IMG` của funnel pilot sang URL thư viện media (và thêm `CONFIG.funnel` nếu thiếu).

```bash
ikf publish /Users/daothinh/ikame/funnel/funnel-development/<app>/<pilot> --slug <pilot>
```
Expected: lint + smoke pass, in `<pilot>@v1` và link preview.

Mở link preview và đi hết các màn trên từng môi trường, đánh dấu từng dòng:
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Facebook in-app browser (gửi link qua Messenger, mở từ app Facebook)
- [ ] Instagram in-app browser (gửi link qua DM, mở từ app Instagram)
- [ ] TikTok in-app browser (gửi link qua DM, mở từ app TikTok)

Mỗi môi trường phải: hiện đủ ảnh/video, bấm qua được mọi màn, `window.__IKF` có trong console (Safari/Chrome remote debug) hoặc header `x-ikf` có trong `curl -I`.

```bash
ikf route set <host>/pilot <pilot>@v1
scripts/measure-propagation.sh "https://<host>/pilot" "<pilot>@1"
```
Expected: `propagated in Ns`, với N ≤ 90.

- [ ] **Step 8: Rollback drill**

```bash
# Tạo v2 (sửa một chữ trong demo.html, publish lại), rồi:
ikf route set <host>/pilot <pilot>@v2
scripts/measure-propagation.sh "https://<host>/pilot" "<pilot>@2"
ikf route rollback <host>/pilot
scripts/measure-propagation.sh "https://<host>/pilot" "<pilot>@1"
ikf route ls <host>
```
Expected: cả hai lần đo ≤ 90 giây. `ls` không có cảnh báo KV chậm. Ghi kết quả vào `ifunnel/docs/` (biên bản drill).

- [ ] **Step 9: Load test**

Run: `k6 run -e TARGET_URL=https://<host>/pilot loadtest/edge-router.js`
Expected: cả hai threshold đạt (`http_req_failed` = 0, `http_req_waiting` p95 < 200ms). Ghi kết quả vào biên bản. Lưu ý k6 chỉ đo từ PoP gần máy chạy. Muốn đo toàn cầu thì chạy thêm từ k6 Cloud hoặc vài vùng khác.

- [ ] **Step 10: Cảnh báo 5xx của Worker**

Spec yêu cầu alarm khi 5xx > 1% trong 5 phút. Cloudflare không gửi alarm này sang SNS/CloudWatch. Vào Cloudflare dashboard → Notifications → Add, chọn loại cảnh báo lỗi của Workers cho script `ikf-edge-router-<env>` nếu account có loại đó, và gửi tới email on-call của plan infra. Nếu account không có loại cảnh báo phù hợp, ghi rõ vào biên bản là **còn thiếu** và báo Tech Lead quyết định (Logpush + alert, hoặc uptime check ngoài). Không đánh dấu task xong mà bỏ trống mục này.

- [ ] **Step 11: Prod**

Lặp lại Step 2–5 với `prod` (GitHub environment `prod` cần reviewer duyệt). Publish funnel pilot lên prod, kiểm tra preview trên iOS Safari và một in-app browser, gắn route vào domain pilot prod, đo propagation. Báo PM để bắt đầu chia 5–10% traffic theo master plan.

---

## Self-Review

**Spec coverage:**

| Spec | Task |
|---|---|
| §1 Thành phần: CLI, publisher, edge-router, route-match | 13–14, 2–9, 10–11, 1 |
| §2 Dữ liệu Postgres, R2 key, KV format, auth 2 quyền | 2, 6, 7, 3 (thêm `admin`, R3) |
| §3 Publish: lint + smoke local, các luật core, R2 trước DB, idempotency | 14, 4, 6 |
| §4 Route: set/rollback/rm/ls/sync, transaction + audit, chiếu toàn bộ host, `--yes` | 7, 13 |
| §5 Edge: KV `cacheTtl` 30, longest prefix, Cache API, chèn `__IKF`, header, preview, 405 | 10 |
| §6 Lỗi edge (KV, R2, log) và core (validate, R2, KV pending + job, rollback, domain disabled, 403) | 11, 4, 6, 7, 8, 3 |
| §6 Alarm 5xx > 1% | 15 Step 10 (cấu hình tay, có thể còn thiếu) |
| §7 Kiểm thử: unit, integration, E2E thiết bị thật, k6 | 1, 4, 6–8, 10–11, 15 |
| §9 Phụ thuộc infra | 12, 15 |

**Placeholder:** giá trị thật (media origin, domain, zone id, token) là đầu vào của Task 0, không phải phần còn thiếu của plan.

**Nhất quán kiểu:**
- `matchRoute`/`normalizePath` dùng giống nhau ở Task 1, 7, 10, 13.
- KV doc `{rev, routes:[{prefix,bundle,funnel,v}]}` giống nhau ở Task 7 (ghi), 10 (đọc), 8 (test).
- `x-ikf` = `<funnel>@<v>; rev=<rev>` ở Task 10, 11, 15.
- Response route `{host, prefix, funnel, v, rev, kv_sync, propagation_seconds}` ở Task 7 và CLI Task 13.

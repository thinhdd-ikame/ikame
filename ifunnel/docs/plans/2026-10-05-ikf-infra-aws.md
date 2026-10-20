# iKame Funnel Platform — Hạ tầng AWS Tier A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng toàn bộ hạ tầng staging + prod (AWS us-east-1 + Cloudflare) bằng Terraform cho platform funnel ở Tier A (~100k sessions/ngày, peak ~40 rps ở edge và ~5 rps vào core). Có một service `core-api` tối thiểu (`/livez`, `/healthz`) chạy end-to-end qua Cloudflare → ALB → ECS → RDS Proxy/Valkey, chịu được load test gấp 10 lần peak.

**Architecture:**
- **Cloudflare** đứng trước mọi thứ: DNS, WAF, rate limit, Turnstile, cùng R2, KV và Queues cho đường nóng (code Worker thuộc plan edge-router).
- **Core trên AWS:**
  - VPC 2 AZ, ALB chỉ nhận traffic từ dải IP Cloudflare và có header bí mật.
  - ECS Fargate ARM, tự scale.
  - RDS PostgreSQL 17 sau RDS Proxy.
  - ElastiCache Valkey.
  - SQS kèm DLQ.
  - KMS ký JWT entitlement.
  - SES gửi OTP.
  - CloudWatch alarm báo qua SNS.
- **Mỗi môi trường** là một root Terraform gọi chung module `infra/stack`, chỉ khác tfvars.

**Tech Stack:** Terraform ≥ 1.10 (`terraform test` với `mock_provider`, S3 native lock) · AWS provider `~> 6.0` · Cloudflare provider `~> 5.0` · `terraform-aws-modules/vpc/aws ~> 6.0` · Node.js 22 + Fastify 5 + Vitest · GitHub Actions (OIDC) · tflint · trivy · k6.

**Spec:** `ifunnel/docs/plans/2026-10-05-ikame-funnel-platform.md` (§11 quyết định, §12 hạ tầng).

## Global Constraints

- Region `us-east-1`. Mọi tài nguyên đặt tên `ikf-<env>-…` và gắn tag `project=ikf`, `env=<env>`, `managed_by=terraform`.
- **Repo mới** `ikf-platform` đặt ở `/Users/daothinh/ikf-platform`. Không đặt trong repo `ikame`, vì repo đó chứa nội dung funnel.
- Hai môi trường: `staging` và `prod`, dùng chung một AWS account (MVP) nhưng **hai Cloudflare zone khác nhau**. Ruleset và zone setting là tài nguyên cấp zone, dùng chung một zone sẽ gây xung đột.
- **Không có giá trị secret trong module:** module chỉ tạo `aws_secretsmanager_secret`, không có `aws_secretsmanager_secret_version`. CI sẽ grep để chặn. Giá trị thật nhập tay qua console/CLI.
- ALB không bao giờ mở `0.0.0.0/0`. Chỉ nhận dải IPv4 của Cloudflare, và request phải có header `X-Origin-Auth` đúng.
- DB và cache không public. Service chỉ nói chuyện với Postgres qua RDS Proxy (TLS bắt buộc).
- Container ECS chạy **ARM64** (Graviton). Image build `linux/arm64`, tag bất biến bằng git SHA.
- Health check của ALB dùng `/livez`, không phụ thuộc DB. `/healthz` kiểm tra DB và cache, dùng cho monitoring và smoke test.
- Prod: Multi-AZ cho RDS và Valkey, một NAT mỗi AZ, `deletion_protection = true`.
- Kích thước Tier A:

  | | staging | prod |
  |---|---|---|
  | RDS | `db.t4g.medium` single-AZ | `db.t4g.large` Multi-AZ |
  | Valkey | `cache.t4g.micro` × 1 | `cache.t4g.small` × 2 |
  | ECS task | 0.25 vCPU / 512MB, 1–2 task | 0.5 vCPU / 1GB, 2–6 task |

## Review Focus

1. **Truy cập thẳng ALB, bỏ qua Cloudflare** (bỏ qua WAF/rate limit): phải bị chặn (timeout hoặc 403). Có test ở Task 8 và smoke ở Task 14.
2. **Autoscale làm cạn connection Postgres:** khi 6 task × pool 10 cùng mở kết nối, RDS Proxy phải gom lại (`max_connections_percent = 80`) và k6 không lỗi. Có test ở Task 3 và Task 14.
3. **Message rơi vào DLQ mà không ai biết:** mỗi DLQ phải có alarm khi > 0. Có test ở Task 11.
4. **Xóa nhầm DB prod** (do `terraform destroy` hoặc đổi tên resource): prod có `deletion_protection` và final snapshot. Có test ở Task 3 và Task 12.
5. **Health check cascade:** Postgres chập chờn không được làm ALB rút hết task (ALB dùng `/livez`). Có test ở Task 7 và Task 8.

## Chi phí ước tính (on-demand, USD/tháng)

| Hạng mục | prod | staging |
|---|---|---|
| RDS (+ storage) + RDS Proxy | ~220 | ~55 |
| ElastiCache Valkey | ~47 | ~12 |
| ECS Fargate ARM | 30–90 | 7–15 |
| ALB | ~26 | ~20 |
| NAT Gateway (+ data) | ~70 | ~35 |
| CloudWatch, Secrets, KMS, ECR, SES | 40–80 | ~25 |
| **AWS** | **~450–550** | **~160–180** |
| Cloudflare (Pro prod zone + Workers Paid) | ~30 + usage | Free zone |
| ClickHouse Cloud (nhỏ nhất, us-east-1) | ~100–250 | dùng chung prod, khác DB |
| **Tổng** | | **≈ $800–1.1k/tháng** |

## File Structure (repo `ikf-platform`)

```
ikf-platform/
├── .github/workflows/
│   ├── infra.yml                 # fmt, lint, trivy, terraform test, plan/apply
│   └── core-api.yml              # test, build arm64, deploy ECS
├── .tflint.hcl
├── .trivyignore
├── infra/
│   ├── bootstrap/                # S3 state bucket + GitHub OIDC roles (apply tay 1 lần)
│   │   ├── main.tf
│   │   └── tests/bootstrap.tftest.hcl
│   ├── modules/
│   │   ├── network/              # VPC 2 AZ, NAT, S3 endpoint
│   │   ├── database/             # RDS PG17, RDS Proxy, client SG
│   │   ├── cache/                # ElastiCache Valkey, client SG
│   │   ├── queues/               # SQS + DLQ
│   │   ├── security/             # KMS JWT key, app secrets (rỗng)
│   │   ├── core-service/         # ECS cluster/service, ALB CF-only, autoscaling
│   │   ├── edge/                 # Cloudflare: DNS api, zone settings, R2, KV, Queues, Turnstile, rulesets
│   │   ├── email/                # SES identity + DKIM/DMARC trên Cloudflare
│   │   └── observability/        # SNS + CloudWatch alarms
│   │   (mỗi module: main.tf, variables.tf, outputs.tf, versions.tf, tests/<name>.tftest.hcl)
│   ├── stack/                    # ghép các module thành 1 môi trường
│   │   ├── main.tf, variables.tf, outputs.tf, versions.tf
│   │   └── tests/stack.tftest.hcl
│   └── envs/
│       ├── staging/{main.tf,backend.tf,terraform.tfvars}
│       └── prod/{main.tf,backend.tf,terraform.tfvars}
├── services/core-api/
│   ├── package.json, Dockerfile
│   ├── src/app.js, src/server.js
│   └── test/app.test.js
├── scripts/
│   ├── deploy-core-api.sh
│   └── smoke.sh
└── loadtest/tier-a.js
```

---

### Task 0: Chuẩn bị đầu vào (thủ công, không có code)

Ai làm: DevOps + PM. Phải xong trước Task 1.

- [ ] **Step 1: AWS.** Có 1 AWS account và một IAM user/SSO có quyền admin để chạy bootstrap. Ghi lại `AWS_ACCOUNT_ID`.
- [ ] **Step 2: Domain.** Chọn 2 domain platform, ví dụ `<prod-domain>` và `<staging-domain>`. Add cả hai vào Cloudflare: zone prod dùng gói **Pro**, zone staging dùng gói **Free**. Đổi nameserver tại nhà đăng ký. Ghi lại `zone_id` và `zone_name` của mỗi zone.
- [ ] **Step 3: Cloudflare account.** Bật **Workers Paid** ($5/tháng, cần cho Queues) và bật R2. Ghi lại `account_id`.
- [ ] **Step 4: Cloudflare API token** cho Terraform, scope gồm:
  - Account: `Workers R2 Storage:Edit`, `Workers KV Storage:Edit`, `Queues:Edit`, `Turnstile:Edit`
  - Zone (2 zone platform): `DNS:Edit`, `Zone Settings:Edit`, `Zone WAF:Edit`, `Transform Rules:Edit`

  Ghi lại token.
- [ ] **Step 5: GitHub.** Tạo repo `ikf-platform` (private) trong org, ghi `org/ikf-platform`. Tạo 2 environment `staging` và `prod`. Environment `prod` cần required reviewers (Tech Lead + DevOps).
- [ ] **Step 6: Email nhận alarm** (ví dụ group `ikf-oncall@…`), ghi lại.
- [ ] **Step 7: ClickHouse Cloud.** Tạo organization; service sẽ tạo ở Task 14.

---

### Task 1: Repo skeleton + bootstrap (state bucket, GitHub OIDC)

**Files:**
- Create: `ikf-platform/.gitignore`, `ikf-platform/.tflint.hcl`, `ikf-platform/.trivyignore`
- Create: `infra/bootstrap/main.tf`
- Test: `infra/bootstrap/tests/bootstrap.tftest.hcl`

**Interfaces:**
- Produces:
  - S3 bucket `var.state_bucket_name`, dùng làm backend cho Task 12.
  - IAM roles `ikf-gha-terraform-staging` và `ikf-gha-terraform-prod`, dùng trong Task 13.

- [ ] **Step 1: Tạo repo**

```bash
mkdir -p /Users/daothinh/ikf-platform && cd /Users/daothinh/ikf-platform
git init -b main
mkdir -p infra/bootstrap/tests
cat > .gitignore <<'EOF'
.terraform/
*.tfstate
*.tfstate.*
crash.log
node_modules/
td.json
td-new.json
EOF
cat > .tflint.hcl <<'EOF'
plugin "terraform" {
  enabled = true
  preset  = "recommended"
}

plugin "aws" {
  enabled = true
  version = "0.38.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}
EOF
cat > .trivyignore <<'EOF'
# ECS tasks need egress to Paddle, Meta CAPI, Adjust and ClickHouse over HTTPS.
AVD-AWS-0104
# ALB is internet-facing by design; ingress is limited to Cloudflare ranges + origin header.
AVD-AWS-0053
EOF
```

- [ ] **Step 2: Viết test fail**

`infra/bootstrap/tests/bootstrap.tftest.hcl`:

```hcl
mock_provider "aws" {
  mock_data "aws_iam_policy_document" {
    defaults = {
      json = "{\"Version\":\"2012-10-17\",\"Statement\":[]}"
    }
  }
}

variables {
  state_bucket_name = "ikf-tfstate-test"
  github_repo       = "ikame/ikf-platform"
}

run "state_bucket_is_versioned_encrypted_and_private" {
  command = apply

  assert {
    condition     = aws_s3_bucket_versioning.state.versioning_configuration[0].status == "Enabled"
    error_message = "State bucket must be versioned so a bad apply can be rolled back."
  }

  assert {
    condition     = aws_s3_bucket_public_access_block.state.block_public_acls && aws_s3_bucket_public_access_block.state.restrict_public_buckets
    error_message = "State bucket must block all public access."
  }
}

run "one_github_role_per_environment" {
  command = apply

  assert {
    condition     = toset(keys(aws_iam_role.gha)) == toset(["staging", "prod"])
    error_message = "Expected exactly one GitHub Actions role for staging and one for prod."
  }

  assert {
    condition     = aws_iam_role.gha["prod"].name == "ikf-gha-terraform-prod"
    error_message = "Role names must follow ikf-gha-terraform-<env>."
  }
}
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

Run: `cd infra/bootstrap && terraform init -backend=false && terraform test`
Expected: FAIL với `Reference to undeclared resource` (chưa có `aws_s3_bucket_versioning.state`).

- [ ] **Step 4: Implement**

`infra/bootstrap/main.tf`:

```hcl
terraform {
  required_version = ">= 1.10.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = { project = "ikf", managed_by = "terraform", stack = "bootstrap" }
  }
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "state_bucket_name" {
  type = string
}

variable "github_repo" {
  type        = string
  description = "GitHub repo in org/name form, e.g. ikame/ikf-platform"
}

locals {
  envs = toset(["staging", "prod"])
}

resource "aws_s3_bucket" "state" {
  bucket = var.state_bucket_name
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket                  = aws_s3_bucket.state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

data "aws_iam_policy_document" "gha_assume" {
  for_each = local.envs

  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:environment:${each.key}"]
    }
  }
}

resource "aws_iam_role" "gha" {
  for_each           = local.envs
  name               = "ikf-gha-terraform-${each.key}"
  assume_role_policy = data.aws_iam_policy_document.gha_assume[each.key].json
}

# MVP: admin for Terraform. Tighten to a scoped policy in P2.
resource "aws_iam_role_policy_attachment" "gha_admin" {
  for_each   = aws_iam_role.gha
  role       = each.value.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

output "state_bucket" {
  value = aws_s3_bucket.state.bucket
}

output "gha_role_arns" {
  value = { for k, r in aws_iam_role.gha : k => r.arn }
}
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `terraform fmt -recursive && terraform test`
Expected: `Success! 2 passed, 0 failed.`

- [ ] **Step 6: Commit**

```bash
cd /Users/daothinh/ikf-platform
git add .gitignore .tflint.hcl .trivyignore infra/bootstrap
git commit -m "feat(infra): bootstrap state bucket and GitHub OIDC roles"
```

---

### Task 2: Module `network`

**Files:**
- Create: `infra/modules/network/{versions.tf,variables.tf,main.tf,outputs.tf}`
- Test: `infra/modules/network/tests/network.tftest.hcl`

**Interfaces:**
- Consumes: không có.
- Produces (outputs):
  - `vpc_id` (string)
  - `public_subnet_ids`, `private_subnet_ids`, `database_subnet_ids` (list(string))
  - `database_subnet_group_name` (string)
  - `nat_public_ips` (list(string))

- [ ] **Step 1: Viết test fail**

`infra/modules/network/tests/network.tftest.hcl`:

```hcl
mock_provider "aws" {
  mock_data "aws_iam_policy_document" {
    defaults = { json = "{}" }
  }
}

variables {
  env                = "staging"
  region             = "us-east-1"
  cidr               = "10.20.0.0/16"
  azs                = ["us-east-1a", "us-east-1b"]
  single_nat_gateway = true
}

run "two_az_layout_with_three_tiers" {
  command = apply

  assert {
    condition     = length(output.public_subnet_ids) == 2 && length(output.private_subnet_ids) == 2 && length(output.database_subnet_ids) == 2
    error_message = "Each tier must have one subnet per AZ."
  }

  assert {
    condition     = length(module.vpc.natgw_ids) == 1
    error_message = "Staging uses a single NAT gateway to save cost."
  }
}

run "prod_has_one_nat_per_az" {
  command = apply

  variables {
    env                = "prod"
    single_nat_gateway = false
  }

  assert {
    condition     = length(module.vpc.natgw_ids) == 2
    error_message = "Prod needs one NAT per AZ so one AZ outage does not cut egress."
  }
}
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `cd infra/modules/network && terraform init -backend=false && terraform test`
Expected: FAIL do chưa khai báo các biến/module (`An input variable with the name "env" has not been declared` hoặc tương tự).

- [ ] **Step 3: Implement**

`versions.tf`:

```hcl
terraform {
  required_version = ">= 1.10.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}
```

`variables.tf`:

```hcl
variable "env" {
  type = string
}

variable "region" {
  type = string
}

variable "cidr" {
  type = string
}

variable "azs" {
  type = list(string)
  validation {
    condition     = length(var.azs) >= 2
    error_message = "At least two AZs are required for RDS Multi-AZ and ALB."
  }
}

variable "single_nat_gateway" {
  type = bool
}
```

`main.tf`:

```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 6.0"

  name = "ikf-${var.env}"
  cidr = var.cidr
  azs  = var.azs

  public_subnets   = [for i, _ in var.azs : cidrsubnet(var.cidr, 8, i)]
  private_subnets  = [for i, _ in var.azs : cidrsubnet(var.cidr, 8, i + 10)]
  database_subnets = [for i, _ in var.azs : cidrsubnet(var.cidr, 8, i + 20)]

  create_database_subnet_group = true
  enable_nat_gateway           = true
  single_nat_gateway           = var.single_nat_gateway
  one_nat_gateway_per_az       = !var.single_nat_gateway
  enable_dns_hostnames         = true
  enable_dns_support           = true
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = module.vpc.private_route_table_ids
}
```

`outputs.tf`:

```hcl
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnets
}

output "private_subnet_ids" {
  value = module.vpc.private_subnets
}

output "database_subnet_ids" {
  value = module.vpc.database_subnets
}

output "database_subnet_group_name" {
  value = module.vpc.database_subnet_group_name
}

output "nat_public_ips" {
  value = module.vpc.nat_public_ips
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `terraform init -backend=false -upgrade && terraform test`
Expected: `Success! 2 passed, 0 failed.`

- [ ] **Step 5: Commit**

```bash
git add infra/modules/network
git commit -m "feat(infra): network module with 2-AZ VPC and NAT per env"
```

---

### Task 3: Module `database` (RDS PostgreSQL 17 + RDS Proxy)

**Files:**
- Create: `infra/modules/database/{versions.tf,variables.tf,main.tf,outputs.tf}`
- Test: `infra/modules/database/tests/database.tftest.hcl`

**Interfaces:**
- Consumes (từ Task 2): `vpc_id`, `database_subnet_ids`, `database_subnet_group_name`.
- Produces:
  - `proxy_endpoint` (string): host dùng cho `DB_HOST`.
  - `client_security_group_id` (string): gắn SG này vào service nào cần nói chuyện với DB.
  - `master_secret_arn` (string): secret do RDS quản lý, JSON có key `username` và `password`.
  - `instance_id` (string), `multi_az` (bool), `deletion_protection` (bool).

- [ ] **Step 1: Viết test fail**

`infra/modules/database/tests/database.tftest.hcl`:

```hcl
mock_provider "aws" {
  mock_resource "aws_db_instance" {
    defaults = {
      master_user_secret = [{
        secret_arn    = "arn:aws:secretsmanager:us-east-1:111111111111:secret:rds!db-test"
        kms_key_id    = "arn:aws:kms:us-east-1:111111111111:key/test"
        secret_status = "active"
      }]
    }
  }
  mock_data "aws_iam_policy_document" {
    defaults = { json = "{}" }
  }
}

variables {
  env                  = "staging"
  vpc_id               = "vpc-123"
  subnet_ids           = ["subnet-a", "subnet-b"]
  db_subnet_group_name = "ikf-staging"
  instance_class       = "db.t4g.medium"
  multi_az             = false
  deletion_protection  = false
}

run "db_is_private_encrypted_and_backed_up" {
  command = apply

  assert {
    condition     = aws_db_instance.this.storage_encrypted && !aws_db_instance.this.publicly_accessible
    error_message = "DB must be encrypted and not publicly accessible."
  }

  assert {
    condition     = aws_db_instance.this.backup_retention_period >= 14 && aws_db_instance.this.skip_final_snapshot == false
    error_message = "DB must keep 14 days of PITR backups and take a final snapshot."
  }

  assert {
    condition     = aws_db_instance.this.engine == "postgres" && startswith(aws_db_instance.this.engine_version, "17")
    error_message = "Engine must be PostgreSQL 17."
  }
}

run "proxy_requires_tls_and_caps_connections" {
  command = apply

  assert {
    condition     = aws_db_proxy.this.require_tls
    error_message = "RDS Proxy must require TLS."
  }

  assert {
    condition     = aws_db_proxy_default_target_group.this.connection_pool_config[0].max_connections_percent == 80
    error_message = "Proxy must cap DB connections at 80% to leave room for admin/migrations."
  }
}

run "prod_profile_is_multi_az_and_protected" {
  command = apply

  variables {
    env                 = "prod"
    instance_class      = "db.t4g.large"
    multi_az            = true
    deletion_protection = true
  }

  assert {
    condition     = output.multi_az && output.deletion_protection
    error_message = "Prod DB must be Multi-AZ with deletion protection."
  }
}
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `cd infra/modules/database && terraform init -backend=false && terraform test`
Expected: FAIL (`aws_db_instance.this` chưa khai báo).

- [ ] **Step 3: Implement**

`versions.tf`: giống nguyên văn `infra/modules/network/versions.tf` (khối `terraform { required_version = ">= 1.10.0" required_providers { aws = { source = "hashicorp/aws", version = "~> 6.0" } } }`).

`variables.tf`:

```hcl
variable "env" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "db_subnet_group_name" {
  type = string
}

variable "instance_class" {
  type = string
}

variable "multi_az" {
  type = bool
}

variable "deletion_protection" {
  type = bool
}

variable "allocated_storage" {
  type    = number
  default = 50
}

variable "max_allocated_storage" {
  type    = number
  default = 200
}

variable "backup_retention_days" {
  type    = number
  default = 14
}
```

`main.tf`:

```hcl
resource "aws_security_group" "client" {
  name        = "ikf-${var.env}-db-client"
  description = "Attach to services that connect to Postgres through RDS Proxy"
  vpc_id      = var.vpc_id
}

resource "aws_security_group" "proxy" {
  name        = "ikf-${var.env}-db-proxy"
  description = "RDS Proxy"
  vpc_id      = var.vpc_id
}

resource "aws_security_group" "db" {
  name        = "ikf-${var.env}-db"
  description = "RDS Postgres, reachable only from RDS Proxy"
  vpc_id      = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "proxy_from_client" {
  security_group_id            = aws_security_group.proxy.id
  referenced_security_group_id = aws_security_group.client.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "proxy_to_db" {
  security_group_id            = aws_security_group.proxy.id
  referenced_security_group_id = aws_security_group.db.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "db_from_proxy" {
  security_group_id            = aws_security_group.db.id
  referenced_security_group_id = aws_security_group.proxy.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
}

resource "aws_db_parameter_group" "pg" {
  name   = "ikf-${var.env}-pg17"
  family = "postgres17"

  parameter {
    name  = "log_min_duration_statement"
    value = "500"
  }
}

resource "aws_db_instance" "this" {
  identifier                   = "ikf-${var.env}"
  engine                       = "postgres"
  engine_version               = "17"
  instance_class               = var.instance_class
  allocated_storage            = var.allocated_storage
  max_allocated_storage        = var.max_allocated_storage
  storage_type                 = "gp3"
  storage_encrypted            = true
  db_name                      = "ikf"
  username                     = "ikf_admin"
  manage_master_user_password  = true
  multi_az                     = var.multi_az
  db_subnet_group_name         = var.db_subnet_group_name
  vpc_security_group_ids       = [aws_security_group.db.id]
  parameter_group_name         = aws_db_parameter_group.pg.name
  backup_retention_period      = var.backup_retention_days
  deletion_protection          = var.deletion_protection
  skip_final_snapshot          = false
  final_snapshot_identifier    = "ikf-${var.env}-final"
  performance_insights_enabled = true
  auto_minor_version_upgrade   = true
  publicly_accessible          = false
  copy_tags_to_snapshot        = true
}

data "aws_iam_policy_document" "proxy_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["rds.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "proxy" {
  name               = "ikf-${var.env}-rds-proxy"
  assume_role_policy = data.aws_iam_policy_document.proxy_assume.json
}

data "aws_iam_policy_document" "proxy_secret" {
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_db_instance.this.master_user_secret[0].secret_arn]
  }
}

resource "aws_iam_role_policy" "proxy" {
  role   = aws_iam_role.proxy.id
  policy = data.aws_iam_policy_document.proxy_secret.json
}

resource "aws_db_proxy" "this" {
  name                   = "ikf-${var.env}"
  engine_family          = "POSTGRESQL"
  role_arn               = aws_iam_role.proxy.arn
  vpc_subnet_ids         = var.subnet_ids
  vpc_security_group_ids = [aws_security_group.proxy.id]
  require_tls            = true
  idle_client_timeout    = 1800

  auth {
    auth_scheme = "SECRETS"
    iam_auth    = "DISABLED"
    secret_arn  = aws_db_instance.this.master_user_secret[0].secret_arn
  }
}

resource "aws_db_proxy_default_target_group" "this" {
  db_proxy_name = aws_db_proxy.this.name

  connection_pool_config {
    max_connections_percent   = 80
    connection_borrow_timeout = 120
  }
}

resource "aws_db_proxy_target" "this" {
  db_proxy_name          = aws_db_proxy.this.name
  target_group_name      = aws_db_proxy_default_target_group.this.name
  db_instance_identifier = aws_db_instance.this.identifier
}
```

`outputs.tf`:

```hcl
output "proxy_endpoint" {
  value = aws_db_proxy.this.endpoint
}

output "client_security_group_id" {
  value = aws_security_group.client.id
}

output "master_secret_arn" {
  value = aws_db_instance.this.master_user_secret[0].secret_arn
}

output "instance_id" {
  value = aws_db_instance.this.identifier
}

output "multi_az" {
  value = aws_db_instance.this.multi_az
}

output "deletion_protection" {
  value = aws_db_instance.this.deletion_protection
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `terraform init -backend=false -upgrade && terraform test`
Expected: `Success! 3 passed, 0 failed.`

- [ ] **Step 5: Commit**

```bash
git add infra/modules/database
git commit -m "feat(infra): RDS Postgres 17 behind RDS Proxy with client SG"
```

---

### Task 4: Module `cache` (ElastiCache Valkey)

**Files:**
- Create: `infra/modules/cache/{versions.tf,variables.tf,main.tf,outputs.tf}`
- Test: `infra/modules/cache/tests/cache.tftest.hcl`

**Interfaces:**
- Consumes (từ Task 2): `vpc_id`, `private_subnet_ids`.
- Produces:
  - `primary_endpoint` (string): host cho `REDIS_HOST`, cổng 6379, TLS.
  - `client_security_group_id` (string).

- [ ] **Step 1: Viết test fail**

`infra/modules/cache/tests/cache.tftest.hcl`:

```hcl
mock_provider "aws" {}

variables {
  env        = "staging"
  vpc_id     = "vpc-123"
  subnet_ids = ["subnet-a", "subnet-b"]
  node_type  = "cache.t4g.micro"
  replicas   = 0
}

run "staging_single_node_encrypted" {
  command = apply

  assert {
    condition     = aws_elasticache_replication_group.this.num_cache_clusters == 1 && aws_elasticache_replication_group.this.automatic_failover_enabled == false
    error_message = "Staging runs one node without failover."
  }

  assert {
    condition     = aws_elasticache_replication_group.this.transit_encryption_enabled && aws_elasticache_replication_group.this.at_rest_encryption_enabled
    error_message = "Cache must encrypt in transit and at rest."
  }

  assert {
    condition     = aws_elasticache_replication_group.this.engine == "valkey"
    error_message = "Engine must be valkey."
  }
}

run "prod_has_replica_and_failover" {
  command = apply

  variables {
    env       = "prod"
    node_type = "cache.t4g.small"
    replicas  = 1
  }

  assert {
    condition     = aws_elasticache_replication_group.this.num_cache_clusters == 2 && aws_elasticache_replication_group.this.automatic_failover_enabled && aws_elasticache_replication_group.this.multi_az_enabled
    error_message = "Prod cache needs a replica in another AZ with automatic failover."
  }
}
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `cd infra/modules/cache && terraform init -backend=false && terraform test`
Expected: FAIL (resource chưa khai báo).

- [ ] **Step 3: Implement**

`versions.tf`: giống nguyên văn `infra/modules/network/versions.tf`.

`variables.tf`:

```hcl
variable "env" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "node_type" {
  type = string
}

variable "replicas" {
  type = number
  validation {
    condition     = var.replicas >= 0 && var.replicas <= 2
    error_message = "replicas must be 0, 1 or 2."
  }
}
```

`main.tf`:

```hcl
resource "aws_security_group" "client" {
  name        = "ikf-${var.env}-cache-client"
  description = "Attach to services that connect to Valkey"
  vpc_id      = var.vpc_id
}

resource "aws_security_group" "cache" {
  name        = "ikf-${var.env}-cache"
  description = "Valkey, reachable only from cache clients"
  vpc_id      = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "cache_from_client" {
  security_group_id            = aws_security_group.cache.id
  referenced_security_group_id = aws_security_group.client.id
  from_port                    = 6379
  to_port                      = 6379
  ip_protocol                  = "tcp"
}

resource "aws_elasticache_subnet_group" "this" {
  name       = "ikf-${var.env}-cache"
  subnet_ids = var.subnet_ids
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id       = "ikf-${var.env}"
  description                = "ikf ${var.env} cache"
  engine                     = "valkey"
  engine_version             = "8.0"
  node_type                  = var.node_type
  num_cache_clusters         = var.replicas + 1
  automatic_failover_enabled = var.replicas > 0
  multi_az_enabled           = var.replicas > 0
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  port                       = 6379
  subnet_group_name          = aws_elasticache_subnet_group.this.name
  security_group_ids         = [aws_security_group.cache.id]
  snapshot_retention_limit   = 1
}
```

`outputs.tf`:

```hcl
output "primary_endpoint" {
  value = aws_elasticache_replication_group.this.primary_endpoint_address
}

output "client_security_group_id" {
  value = aws_security_group.client.id
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `terraform test`
Expected: `Success! 2 passed, 0 failed.`

- [ ] **Step 5: Commit**

```bash
git add infra/modules/cache
git commit -m "feat(infra): ElastiCache Valkey with client SG"
```

---

### Task 5: Module `queues` (SQS + DLQ)

**Files:**
- Create: `infra/modules/queues/{versions.tf,variables.tf,main.tf,outputs.tf}`
- Test: `infra/modules/queues/tests/queues.tftest.hcl`

**Interfaces:**
- Consumes: không có.
- Produces:
  - `queue_urls` (map(string)), ví dụ key `relay`, `webhooks`.
  - `queue_arns` (map(string)).
  - `queue_names` (map(string)), `dlq_names` (map(string)): dùng cho alarm ở Task 11.

- [ ] **Step 1: Viết test fail**

`infra/modules/queues/tests/queues.tftest.hcl`:

```hcl
mock_provider "aws" {}

variables {
  env         = "staging"
  queue_names = ["relay", "webhooks"]
}

run "every_queue_has_a_dlq_after_5_attempts" {
  command = apply

  assert {
    condition     = toset(keys(aws_sqs_queue.main)) == toset(["relay", "webhooks"]) && toset(keys(aws_sqs_queue.dlq)) == toset(["relay", "webhooks"])
    error_message = "Each queue needs a matching DLQ."
  }

  assert {
    condition     = alltrue([for k, q in aws_sqs_queue.main : jsondecode(q.redrive_policy).maxReceiveCount == 5 && jsondecode(q.redrive_policy).deadLetterTargetArn == aws_sqs_queue.dlq[k].arn])
    error_message = "Each queue must redrive to its own DLQ after 5 receives."
  }

  assert {
    condition     = alltrue([for q in aws_sqs_queue.dlq : q.message_retention_seconds == 1209600])
    error_message = "DLQs keep messages for the 14-day maximum so they can be replayed."
  }

  assert {
    condition     = output.dlq_names["relay"] == "ikf-staging-relay-dlq"
    error_message = "DLQ naming must be ikf-<env>-<name>-dlq."
  }
}
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `cd infra/modules/queues && terraform init -backend=false && terraform test`
Expected: FAIL.

- [ ] **Step 3: Implement**

`versions.tf`: giống nguyên văn `infra/modules/network/versions.tf`.

`variables.tf`:

```hcl
variable "env" {
  type = string
}

variable "queue_names" {
  type = list(string)
}

variable "max_receive_count" {
  type    = number
  default = 5
}
```

`main.tf`:

```hcl
locals {
  names = toset(var.queue_names)
}

resource "aws_sqs_queue" "dlq" {
  for_each                  = local.names
  name                      = "ikf-${var.env}-${each.key}-dlq"
  message_retention_seconds = 1209600
  sqs_managed_sse_enabled   = true
}

resource "aws_sqs_queue" "main" {
  for_each                   = local.names
  name                       = "ikf-${var.env}-${each.key}"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 345600
  receive_wait_time_seconds  = 20
  sqs_managed_sse_enabled    = true
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq[each.key].arn
    maxReceiveCount     = var.max_receive_count
  })
}
```

`outputs.tf`:

```hcl
output "queue_urls" {
  value = { for k, q in aws_sqs_queue.main : k => q.url }
}

output "queue_arns" {
  value = { for k, q in aws_sqs_queue.main : k => q.arn }
}

output "queue_names" {
  value = { for k, q in aws_sqs_queue.main : k => q.name }
}

output "dlq_names" {
  value = { for k, q in aws_sqs_queue.dlq : k => q.name }
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `terraform test`
Expected: `Success! 1 passed, 0 failed.`

- [ ] **Step 5: Commit**

```bash
git add infra/modules/queues
git commit -m "feat(infra): SQS queues with DLQ redrive"
```

---

### Task 6: Module `security` (KMS ký JWT + app secrets rỗng)

**Files:**
- Create: `infra/modules/security/{versions.tf,variables.tf,main.tf,outputs.tf}`
- Test: `infra/modules/security/tests/security.tftest.hcl`

**Interfaces:**
- Produces:
  - `jwt_key_arn` (string): khóa KMS ECC P-256, dùng `kms:Sign` để ký JWT entitlement (ES256).
  - `secret_arns` (map(string)): key là tên secret, ví dụ `paddle-api-key`.

- [ ] **Step 1: Viết test fail**

`infra/modules/security/tests/security.tftest.hcl`:

```hcl
mock_provider "aws" {}

variables {
  env          = "staging"
  secret_names = ["paddle-api-key", "paddle-webhook-secret", "meta-capi-token", "adjust-s2s-token", "clickhouse-url"]
}

run "jwt_key_is_asymmetric_p256_signing_key" {
  command = apply

  assert {
    condition     = aws_kms_key.jwt.key_usage == "SIGN_VERIFY" && aws_kms_key.jwt.customer_master_key_spec == "ECC_NIST_P256"
    error_message = "JWT key must be ECC_NIST_P256 SIGN_VERIFY (ES256)."
  }

  assert {
    condition     = aws_kms_alias.jwt.name == "alias/ikf-staging-jwt"
    error_message = "Alias must be alias/ikf-<env>-jwt."
  }
}

run "one_empty_secret_per_name_under_env_prefix" {
  command = apply

  assert {
    condition     = length(output.secret_arns) == 5 && aws_secretsmanager_secret.app["paddle-api-key"].name == "ikf/staging/paddle-api-key"
    error_message = "Secrets must be created as ikf/<env>/<name>, one per name."
  }
}
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `cd infra/modules/security && terraform init -backend=false && terraform test`
Expected: FAIL.

- [ ] **Step 3: Implement**

`versions.tf`: giống nguyên văn `infra/modules/network/versions.tf`.

`variables.tf`:

```hcl
variable "env" {
  type = string
}

variable "secret_names" {
  type = list(string)
}
```

`main.tf`:

```hcl
resource "aws_kms_key" "jwt" {
  description              = "ikf ${var.env} entitlement JWT signing (ES256)"
  key_usage                = "SIGN_VERIFY"
  customer_master_key_spec = "ECC_NIST_P256"
  deletion_window_in_days  = 30
}

resource "aws_kms_alias" "jwt" {
  name          = "alias/ikf-${var.env}-jwt"
  target_key_id = aws_kms_key.jwt.key_id
}

# Values are set by hand (console or `aws secretsmanager put-secret-value`), never in Terraform.
resource "aws_secretsmanager_secret" "app" {
  for_each                = toset(var.secret_names)
  name                    = "ikf/${var.env}/${each.key}"
  recovery_window_in_days = 7
}
```

`outputs.tf`:

```hcl
output "jwt_key_arn" {
  value = aws_kms_key.jwt.arn
}

output "secret_arns" {
  value = { for k, s in aws_secretsmanager_secret.app : k => s.arn }
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `terraform test`
Expected: `Success! 2 passed, 0 failed.`

- [ ] **Step 5: Commit**

```bash
git add infra/modules/security
git commit -m "feat(infra): KMS JWT signing key and empty app secrets"
```

---

### Task 7: Service `core-api` tối thiểu (`/livez`, `/healthz`)

**Files:**
- Create: `services/core-api/package.json`, `services/core-api/Dockerfile`, `services/core-api/.dockerignore`
- Create: `services/core-api/src/app.js`, `services/core-api/src/server.js`
- Test: `services/core-api/test/app.test.js`

**Interfaces:**
- Produces:
  - Container nghe cổng `8080`.
  - `GET /livez` → `200 {"status":"ok"}`, không chạm dependency.
  - `GET /healthz` → `200 {"status":"ok","checks":{"db":"ok","cache":"ok"}}`, hoặc `503` với `"status":"degraded"` và check hỏng ghi `"fail"`.
  - Biến môi trường cần: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `REDIS_HOST`.
  - `buildApp({ checks, timeoutMs })` (export từ `src/app.js`): plan core API sau sẽ mở rộng từ đây.

- [ ] **Step 1: Khởi tạo package**

```bash
mkdir -p services/core-api/src services/core-api/test && cd services/core-api
cat > package.json <<'EOF'
{
  "name": "@ikf/core-api",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" },
  "scripts": {
    "start": "node src/server.js",
    "test": "vitest run"
  }
}
EOF
npm install fastify@^5 pg@^8 redis@^4
npm install -D vitest@^3
```

- [ ] **Step 2: Viết test fail**

`services/core-api/test/app.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { buildApp } from '../src/app.js';

const ok = () => Promise.resolve();
const down = () => Promise.reject(new Error('connection refused'));
const hang = () => new Promise(() => {});

describe('core-api health endpoints', () => {
  it('livez is 200 even when every dependency is down', async () => {
    const app = buildApp({ checks: { db: down, cache: down } });
    const res = await app.inject({ method: 'GET', url: '/livez' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
  });

  it('healthz is 200 when all checks pass', async () => {
    const app = buildApp({ checks: { db: ok, cache: ok } });
    const res = await app.inject({ method: 'GET', url: '/healthz' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok', checks: { db: 'ok', cache: 'ok' } });
  });

  it('healthz is 503 and names the failing dependency', async () => {
    const app = buildApp({ checks: { db: down, cache: ok } });
    const res = await app.inject({ method: 'GET', url: '/healthz' });
    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({ status: 'degraded', checks: { db: 'fail', cache: 'ok' } });
  });

  it('healthz treats a hung dependency as failed after the timeout', async () => {
    const app = buildApp({ checks: { db: hang }, timeoutMs: 50 });
    const started = Date.now();
    const res = await app.inject({ method: 'GET', url: '/healthz' });
    expect(res.statusCode).toBe(503);
    expect(res.json().checks.db).toBe('fail');
    expect(Date.now() - started).toBeLessThan(1000);
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận FAIL**

Run: `npx vitest run`
Expected: FAIL với `Failed to load url ../src/app.js`.

- [ ] **Step 4: Implement**

`services/core-api/src/app.js`:

```js
import Fastify from 'fastify';

export function buildApp({ checks = {}, timeoutMs = 1000, logger = false } = {}) {
  const app = Fastify({ logger });

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

`services/core-api/src/server.js`:

```js
import pg from 'pg';
import { createClient } from 'redis';
import { buildApp } from './app.js';

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: 'ikf',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: true },
  max: 10,
  idleTimeoutMillis: 30000,
});

const redis = createClient({ url: `rediss://${process.env.REDIS_HOST}:6379` });
redis.on('error', (err) => console.error('redis error', err.message));
await redis.connect().catch((err) => console.error('redis connect failed', err.message));

const app = buildApp({
  logger: true,
  checks: {
    db: () => pool.query('select 1'),
    cache: () => redis.ping(),
  },
});

const shutdown = async () => {
  await app.close();
  await Promise.allSettled([pool.end(), redis.quit()]);
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

await app.listen({ host: '0.0.0.0', port: 8080 });
```

`services/core-api/Dockerfile`:

```dockerfile
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
USER node
EXPOSE 8080
CMD ["node", "src/server.js"]
```

`services/core-api/.dockerignore`:

```
node_modules
test
```

- [ ] **Step 5: Chạy test, xác nhận PASS**

Run: `npx vitest run`
Expected: `4 passed`.

- [ ] **Step 6: Build thử image ARM64**

Run: `docker buildx build --platform linux/arm64 -t ikf-core-api:local .`
Expected: build thành công.

- [ ] **Step 7: Commit**

```bash
cd /Users/daothinh/ikf-platform
git add services/core-api
git commit -m "feat(core-api): livez/healthz skeleton with dependency timeouts"
```

---

### Task 8: Module `core-service` (ECS Fargate + ALB chỉ nhận từ Cloudflare)

**Files:**
- Create: `infra/modules/core-service/{versions.tf,variables.tf,main.tf,outputs.tf}`
- Test: `infra/modules/core-service/tests/core_service.tftest.hcl`

**Interfaces:**
- Consumes:
  - Task 2: `vpc_id`, `public_subnet_ids`, `private_subnet_ids`.
  - Task 3/4: `client_security_group_id`, truyền vào qua `extra_security_group_ids`.
  - Task 12: `certificate_arn`, `origin_auth_secret`, `image`, `task_policy_json`.
- Produces:
  - `alb_dns_name`, `alb_arn_suffix`, `target_group_arn_suffix`
  - `cluster_name`, `service_name` (= `"core-api"`), `task_family`
  - `task_security_group_ids` (list(string))

- [ ] **Step 1: Viết test fail**

`infra/modules/core-service/tests/core_service.tftest.hcl`:

```hcl
mock_provider "aws" {
  mock_data "aws_iam_policy_document" {
    defaults = { json = "{\"Version\":\"2012-10-17\",\"Statement\":[]}" }
  }
}

variables {
  env                      = "staging"
  region                   = "us-east-1"
  vpc_id                   = "vpc-123"
  public_subnet_ids        = ["subnet-pa", "subnet-pb"]
  private_subnet_ids       = ["subnet-a", "subnet-b"]
  cloudflare_cidrs         = ["173.245.48.0/20", "103.21.244.0/22"]
  origin_auth_secret       = "test-origin-secret"
  certificate_arn          = "arn:aws:acm:us-east-1:111111111111:certificate/test"
  image                    = "111111111111.dkr.ecr.us-east-1.amazonaws.com/ikf-staging/core-api:bootstrap"
  cpu                      = 256
  memory                   = 512
  min_count                = 1
  max_count                = 2
  extra_security_group_ids = ["sg-db-client", "sg-cache-client"]
  environment              = { APP_ENV = "staging" }
  secrets                  = { DB_USER = "arn:aws:secretsmanager:us-east-1:111111111111:secret:db:username::" }
  secret_arns              = ["arn:aws:secretsmanager:us-east-1:111111111111:secret:db"]
  task_policy_json         = "{\"Version\":\"2012-10-17\",\"Statement\":[]}"
}

run "alb_only_accepts_cloudflare_on_443" {
  command = apply

  assert {
    condition     = toset([for r in aws_vpc_security_group_ingress_rule.alb_https_cf : r.cidr_ipv4]) == toset(var.cloudflare_cidrs)
    error_message = "ALB ingress must be exactly the Cloudflare ranges."
  }

  assert {
    condition     = alltrue([for r in aws_vpc_security_group_ingress_rule.alb_https_cf : r.from_port == 443 && r.to_port == 443])
    error_message = "ALB ingress must be HTTPS only."
  }
}

run "requests_without_origin_header_get_403" {
  command = apply

  assert {
    condition     = aws_lb_listener.https.default_action[0].type == "fixed-response" && aws_lb_listener.https.default_action[0].fixed_response[0].status_code == "403"
    error_message = "Default listener action must be 403."
  }

  assert {
    condition     = anytrue([for c in aws_lb_listener_rule.from_cloudflare.condition : length(c.http_header) > 0 && c.http_header[0].http_header_name == "X-Origin-Auth"])
    error_message = "Forwarding must require the X-Origin-Auth header."
  }
}

run "alb_health_check_uses_livez" {
  command = apply

  assert {
    condition     = aws_lb_target_group.api.health_check[0].path == "/livez"
    error_message = "Target health must use /livez so DB blips do not drain all tasks."
  }
}

run "tasks_are_private_and_roll_back_on_failure" {
  command = apply

  assert {
    condition     = aws_ecs_service.api.network_configuration[0].assign_public_ip == false
    error_message = "Tasks must not get public IPs."
  }

  assert {
    condition     = aws_ecs_service.api.deployment_circuit_breaker[0].enable && aws_ecs_service.api.deployment_circuit_breaker[0].rollback
    error_message = "Failed deployments must roll back automatically."
  }

  assert {
    condition     = contains(output.task_security_group_ids, "sg-db-client") && contains(output.task_security_group_ids, "sg-cache-client")
    error_message = "Tasks must carry the DB and cache client security groups."
  }

  assert {
    condition     = aws_appautoscaling_target.api.min_capacity == 1 && aws_appautoscaling_target.api.max_capacity == 2
    error_message = "Autoscaling bounds must follow min_count/max_count."
  }
}

run "rejects_open_ingress" {
  command = plan

  variables {
    cloudflare_cidrs = ["0.0.0.0/0"]
  }

  expect_failures = [var.cloudflare_cidrs]
}
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `cd infra/modules/core-service && terraform init -backend=false && terraform test`
Expected: FAIL.

- [ ] **Step 3: Implement**

`versions.tf`: giống nguyên văn `infra/modules/network/versions.tf`.

`variables.tf`:

```hcl
variable "env" {
  type = string
}

variable "region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "cloudflare_cidrs" {
  type = list(string)
  validation {
    condition     = length(var.cloudflare_cidrs) > 0 && !contains(var.cloudflare_cidrs, "0.0.0.0/0")
    error_message = "ALB ingress must be limited to Cloudflare IPv4 ranges."
  }
}

variable "origin_auth_secret" {
  type      = string
  sensitive = true
}

variable "certificate_arn" {
  type = string
}

variable "image" {
  type = string
}

variable "cpu" {
  type = number
}

variable "memory" {
  type = number
}

variable "min_count" {
  type = number
}

variable "max_count" {
  type = number
}

variable "requests_per_task" {
  type    = number
  default = 300
}

variable "extra_security_group_ids" {
  type    = list(string)
  default = []
}

variable "environment" {
  type    = map(string)
  default = {}
}

variable "secrets" {
  type        = map(string)
  default     = {}
  description = "Env var name => Secrets Manager valueFrom (arn or arn:key::)."
}

variable "secret_arns" {
  type        = list(string)
  default     = []
  description = "Base secret ARNs the execution role may read."
}

variable "task_policy_json" {
  type = string
}

variable "log_retention_days" {
  type    = number
  default = 30
}
```

`main.tf`:

```hcl
locals {
  name = "ikf-${var.env}"
}

resource "aws_ecs_cluster" "this" {
  name = local.name
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ikf/${var.env}/core-api"
  retention_in_days = var.log_retention_days
}

# --- Security groups ---

resource "aws_security_group" "alb" {
  name        = "${local.name}-alb"
  description = "Public ALB, Cloudflare ranges only"
  vpc_id      = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "alb_https_cf" {
  for_each          = toset(var.cloudflare_cidrs)
  security_group_id = aws_security_group.alb.id
  cidr_ipv4         = each.value
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
}

resource "aws_security_group" "task" {
  name        = "${local.name}-core-api"
  description = "core-api tasks"
  vpc_id      = var.vpc_id
}

resource "aws_vpc_security_group_egress_rule" "alb_to_tasks" {
  security_group_id            = aws_security_group.alb.id
  referenced_security_group_id = aws_security_group.task.id
  from_port                    = 8080
  to_port                      = 8080
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "task_from_alb" {
  security_group_id            = aws_security_group.task.id
  referenced_security_group_id = aws_security_group.alb.id
  from_port                    = 8080
  to_port                      = 8080
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "task_all" {
  security_group_id = aws_security_group.task.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

# --- ALB ---

resource "aws_lb" "api" {
  name                       = "${local.name}-api"
  load_balancer_type         = "application"
  subnets                    = var.public_subnet_ids
  security_groups            = [aws_security_group.alb.id]
  drop_invalid_header_fields = true
  idle_timeout               = 60
}

resource "aws_lb_target_group" "api" {
  name                 = "${local.name}-api"
  port                 = 8080
  protocol             = "HTTP"
  target_type          = "ip"
  vpc_id               = var.vpc_id
  deregistration_delay = 30

  health_check {
    path                = "/livez"
    matcher             = "200"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.api.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "forbidden"
      status_code  = "403"
    }
  }
}

resource "aws_lb_listener_rule" "from_cloudflare" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    http_header {
      http_header_name = "X-Origin-Auth"
      values           = [var.origin_auth_secret]
    }
  }
}

# --- IAM ---

data "aws_iam_policy_document" "ecs_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "execution" {
  name               = "${local.name}-core-api-exec"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy_attachment" "execution_managed" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "execution_secrets" {
  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = var.secret_arns
  }
}

resource "aws_iam_role_policy" "execution_secrets" {
  role   = aws_iam_role.execution.id
  policy = data.aws_iam_policy_document.execution_secrets.json
}

resource "aws_iam_role" "task" {
  name               = "${local.name}-core-api-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy" "task" {
  role   = aws_iam_role.task.id
  policy = var.task_policy_json
}

# --- ECS ---

resource "aws_ecs_task_definition" "api" {
  family                   = "${local.name}-core-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  container_definitions = jsonencode([{
    name         = "core-api"
    image        = var.image
    essential    = true
    portMappings = [{ containerPort = 8080, protocol = "tcp" }]
    environment  = [for k, v in var.environment : { name = k, value = v }]
    secrets      = [for k, v in var.secrets : { name = k, valueFrom = v }]
    stopTimeout  = 30
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.api.name
        "awslogs-region"        = var.region
        "awslogs-stream-prefix" = "api"
      }
    }
  }])
}

resource "aws_ecs_service" "api" {
  name                               = "core-api"
  cluster                            = aws_ecs_cluster.this.id
  task_definition                    = aws_ecs_task_definition.api.arn
  desired_count                      = var.min_count
  launch_type                        = "FARGATE"
  health_check_grace_period_seconds  = 30
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = concat([aws_security_group.task.id], var.extra_security_group_ids)
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "core-api"
    container_port   = 8080
  }

  # Image rollouts are done by scripts/deploy-core-api.sh (new revision of the same family);
  # autoscaling owns desired_count.
  lifecycle {
    ignore_changes = [desired_count, task_definition]
  }

  depends_on = [aws_lb_listener_rule.from_cloudflare]
}

resource "aws_appautoscaling_target" "api" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.this.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = var.min_count
  max_capacity       = var.max_count
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "${local.name}-core-api-cpu"
  policy_type        = "TargetTrackingScaling"
  service_namespace  = aws_appautoscaling_target.api.service_namespace
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension

  target_tracking_scaling_policy_configuration {
    target_value       = 60
    scale_in_cooldown  = 120
    scale_out_cooldown = 30
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}

resource "aws_appautoscaling_policy" "requests" {
  name               = "${local.name}-core-api-requests"
  policy_type        = "TargetTrackingScaling"
  service_namespace  = aws_appautoscaling_target.api.service_namespace
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension

  target_tracking_scaling_policy_configuration {
    target_value       = var.requests_per_task
    scale_in_cooldown  = 120
    scale_out_cooldown = 30
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.api.arn_suffix}/${aws_lb_target_group.api.arn_suffix}"
    }
  }
}
```

`outputs.tf`:

```hcl
output "alb_dns_name" {
  value = aws_lb.api.dns_name
}

output "alb_arn_suffix" {
  value = aws_lb.api.arn_suffix
}

output "target_group_arn_suffix" {
  value = aws_lb_target_group.api.arn_suffix
}

output "cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "service_name" {
  value = aws_ecs_service.api.name
}

output "task_family" {
  value = aws_ecs_task_definition.api.family
}

output "task_security_group_ids" {
  value = concat([aws_security_group.task.id], var.extra_security_group_ids)
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `terraform test`
Expected: `Success! 5 passed, 0 failed.`

- [ ] **Step 5: Commit**

```bash
git add infra/modules/core-service
git commit -m "feat(infra): ECS core-api behind Cloudflare-only ALB with autoscaling"
```

---

### Task 9: Module `edge` (Cloudflare)

**Files:**
- Create: `infra/modules/edge/{versions.tf,variables.tf,main.tf,outputs.tf}`
- Test: `infra/modules/edge/tests/edge.tftest.hcl`

**Interfaces:**
- Consumes (từ Task 8 qua Task 12): `alb_dns_name`, `origin_auth_secret`.
- Produces (dùng ở plan edge-router):
  - `api_fqdn`
  - `r2_bucket_name`, `kv_namespace_id`
  - `events_queue_name`, `events_dlq_name`
  - `turnstile_sitekey`, `turnstile_secret` (sensitive)

- [ ] **Step 1: Viết test fail**

`infra/modules/edge/tests/edge.tftest.hcl`:

```hcl
mock_provider "cloudflare" {}

variables {
  env                = "staging"
  account_id         = "acc123"
  zone_id            = "zone123"
  zone_name          = "ikf-staging.example"
  alb_dns_name       = "ikf-staging-api-123.us-east-1.elb.amazonaws.com"
  origin_auth_secret = "test-origin-secret"
}

run "api_record_is_proxied_through_cloudflare" {
  command = apply

  assert {
    condition     = cloudflare_dns_record.api.proxied && cloudflare_dns_record.api.content == var.alb_dns_name
    error_message = "api record must be a proxied CNAME to the ALB."
  }

  assert {
    condition     = output.api_fqdn == "api.ikf-staging.example"
    error_message = "API hostname must be api.<zone>."
  }
}

run "origin_header_is_injected_for_api_host" {
  command = apply

  assert {
    condition     = cloudflare_ruleset.origin_auth.phase == "http_request_late_transform" && cloudflare_ruleset.origin_auth.rules[0].action_parameters.headers["X-Origin-Auth"].value == var.origin_auth_secret
    error_message = "Cloudflare must set X-Origin-Auth on requests to the API host."
  }
}

run "sensitive_paths_are_rate_limited" {
  command = apply

  assert {
    condition     = alltrue([for p in ["/v1/otp", "/v1/checkout", "/v1/claim"] : strcontains(cloudflare_ruleset.ratelimit.rules[0].expression, "\"${p}\"")])
    error_message = "OTP, checkout and claim must be rate limited."
  }
}

run "edge_storage_named_per_env" {
  command = apply

  assert {
    condition     = cloudflare_r2_bucket.bundles.name == "ikf-bundles-staging" && cloudflare_queue.events.queue_name == "ikf-events-staging"
    error_message = "Edge resources must be named per environment."
  }

  assert {
    condition     = cloudflare_turnstile_widget.this.mode == "managed"
    error_message = "Turnstile must run in managed mode."
  }
}
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `cd infra/modules/edge && terraform init -backend=false && terraform test`
Expected: FAIL.

- [ ] **Step 3: Implement**

`versions.tf`:

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

`variables.tf`:

```hcl
variable "env" {
  type = string
}

variable "account_id" {
  type = string
}

variable "zone_id" {
  type = string
}

variable "zone_name" {
  type = string
}

variable "alb_dns_name" {
  type = string
}

variable "origin_auth_secret" {
  type      = string
  sensitive = true
}

variable "rate_limited_paths" {
  type    = list(string)
  default = ["/v1/otp", "/v1/checkout", "/v1/claim"]
}

variable "rate_limit_requests_per_10s" {
  type    = number
  default = 5
}
```

`main.tf`:

```hcl
locals {
  api_fqdn = "api.${var.zone_name}"
  paths    = join(" ", [for p in var.rate_limited_paths : "\"${p}\""])
}

resource "cloudflare_zone_setting" "ssl" {
  zone_id    = var.zone_id
  setting_id = "ssl"
  value      = "strict"
}

resource "cloudflare_zone_setting" "min_tls" {
  zone_id    = var.zone_id
  setting_id = "min_tls_version"
  value      = "1.2"
}

resource "cloudflare_zone_setting" "always_https" {
  zone_id    = var.zone_id
  setting_id = "always_use_https"
  value      = "on"
}

resource "cloudflare_dns_record" "api" {
  zone_id = var.zone_id
  name    = local.api_fqdn
  type    = "CNAME"
  content = var.alb_dns_name
  proxied = true
  ttl     = 1
}

resource "cloudflare_ruleset" "origin_auth" {
  zone_id = var.zone_id
  name    = "ikf origin auth header"
  kind    = "zone"
  phase   = "http_request_late_transform"
  rules = [{
    description = "Prove to the ALB that the request came through Cloudflare"
    expression  = "(http.host eq \"${local.api_fqdn}\")"
    action      = "rewrite"
    action_parameters = {
      headers = {
        "X-Origin-Auth" = {
          operation = "set"
          value     = var.origin_auth_secret
        }
      }
    }
  }]
}

resource "cloudflare_ruleset" "ratelimit" {
  zone_id = var.zone_id
  name    = "ikf rate limits"
  kind    = "zone"
  phase   = "http_ratelimit"
  rules = [{
    description = "Throttle OTP, checkout and claim per IP"
    expression  = "(http.host eq \"${local.api_fqdn}\" and http.request.uri.path in {${local.paths}})"
    action      = "block"
    ratelimit = {
      characteristics     = ["ip.src", "cf.colo.id"]
      period              = 10
      requests_per_period = var.rate_limit_requests_per_10s
      mitigation_timeout  = 10
    }
  }]
}

resource "cloudflare_r2_bucket" "bundles" {
  account_id = var.account_id
  name       = "ikf-bundles-${var.env}"
  location   = "enam"
}

resource "cloudflare_workers_kv_namespace" "routing" {
  account_id = var.account_id
  title      = "ikf-routing-${var.env}"
}

resource "cloudflare_queue" "events" {
  account_id = var.account_id
  queue_name = "ikf-events-${var.env}"
}

resource "cloudflare_queue" "events_dlq" {
  account_id = var.account_id
  queue_name = "ikf-events-${var.env}-dlq"
}

resource "cloudflare_turnstile_widget" "this" {
  account_id = var.account_id
  name       = "ikf-${var.env}"
  domains    = [var.zone_name]
  mode       = "managed"
}
```

`outputs.tf`:

```hcl
output "api_fqdn" {
  value = local.api_fqdn
}

output "r2_bucket_name" {
  value = cloudflare_r2_bucket.bundles.name
}

output "kv_namespace_id" {
  value = cloudflare_workers_kv_namespace.routing.id
}

output "events_queue_name" {
  value = cloudflare_queue.events.queue_name
}

output "events_dlq_name" {
  value = cloudflare_queue.events_dlq.queue_name
}

output "turnstile_sitekey" {
  value = cloudflare_turnstile_widget.this.sitekey
}

output "turnstile_secret" {
  value     = cloudflare_turnstile_widget.this.secret
  sensitive = true
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `terraform test`
Expected: `Success! 4 passed, 0 failed.`
Nếu provider báo sai schema (ví dụ tên thuộc tính Cloudflare v5 khác), sửa theo thông báo của `terraform validate` rồi chạy lại test. Không được xóa assert.

- [ ] **Step 5: Commit**

```bash
git add infra/modules/edge
git commit -m "feat(infra): Cloudflare edge resources, origin header and rate limits"
```

---

### Task 10: Module `email` (SES + DKIM/DMARC trên Cloudflare)

**Files:**
- Create: `infra/modules/email/{versions.tf,variables.tf,main.tf,outputs.tf}`
- Test: `infra/modules/email/tests/email.tftest.hcl`

**Interfaces:**
- Produces: `mail_domain` (string), dùng cho `MAIL_FROM=no-reply@<mail_domain>` của core-api.

- [ ] **Step 1: Viết test fail**

`infra/modules/email/tests/email.tftest.hcl`:

```hcl
mock_provider "aws" {
  mock_resource "aws_sesv2_email_identity" {
    defaults = {
      dkim_signing_attributes = [{
        tokens                     = ["tok1", "tok2", "tok3"]
        current_signing_key_length = "RSA_2048_BIT"
        next_signing_key_length    = "RSA_2048_BIT"
        signing_attributes_origin  = "AWS_SES"
        status                     = "PENDING"
        domain_signing_private_key = null
        domain_signing_selector    = null
        last_key_generation_timestamp = ""
      }]
    }
  }
}

mock_provider "cloudflare" {}

variables {
  zone_id     = "zone123"
  mail_domain = "mail.ikf-staging.example"
}

run "three_dkim_cnames_not_proxied" {
  command = apply

  assert {
    condition     = length(cloudflare_dns_record.dkim) == 3
    error_message = "SES Easy DKIM needs exactly three CNAME records."
  }

  assert {
    condition     = alltrue([for r in cloudflare_dns_record.dkim : !r.proxied && endswith(r.content, ".dkim.amazonses.com")])
    error_message = "DKIM records must be DNS-only CNAMEs to amazonses."
  }

  assert {
    condition     = cloudflare_dns_record.dkim[0].name == "tok1._domainkey.mail.ikf-staging.example"
    error_message = "DKIM record name must be <token>._domainkey.<mail_domain>."
  }
}

run "dmarc_record_exists" {
  command = apply

  assert {
    condition     = startswith(cloudflare_dns_record.dmarc.content, "v=DMARC1")
    error_message = "A DMARC policy is required for inbox placement of OTP mail."
  }
}
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `cd infra/modules/email && terraform init -backend=false && terraform test`
Expected: FAIL.

- [ ] **Step 3: Implement**

`versions.tf`:

```hcl
terraform {
  required_version = ">= 1.10.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}
```

`variables.tf`:

```hcl
variable "zone_id" {
  type = string
}

variable "mail_domain" {
  type = string
}
```

`main.tf`:

```hcl
resource "aws_sesv2_email_identity" "mail" {
  email_identity = var.mail_domain
}

# SES Easy DKIM always issues exactly three tokens.
resource "cloudflare_dns_record" "dkim" {
  count   = 3
  zone_id = var.zone_id
  name    = "${aws_sesv2_email_identity.mail.dkim_signing_attributes[0].tokens[count.index]}._domainkey.${var.mail_domain}"
  type    = "CNAME"
  content = "${aws_sesv2_email_identity.mail.dkim_signing_attributes[0].tokens[count.index]}.dkim.amazonses.com"
  proxied = false
  ttl     = 3600
}

resource "cloudflare_dns_record" "dmarc" {
  zone_id = var.zone_id
  name    = "_dmarc.${var.mail_domain}"
  type    = "TXT"
  content = "v=DMARC1; p=none; adkim=s; aspf=r"
  ttl     = 3600
}
```

`outputs.tf`:

```hcl
output "mail_domain" {
  value = var.mail_domain
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `terraform test`
Expected: `Success! 2 passed, 0 failed.`
Nếu mock của `dkim_signing_attributes` bị từ chối vì thiếu hoặc thừa thuộc tính, chỉnh object mock theo thông báo lỗi, giữ nguyên `tokens`.

- [ ] **Step 5: Commit**

```bash
git add infra/modules/email
git commit -m "feat(infra): SES identity with DKIM and DMARC records"
```

---

### Task 11: Module `observability` (SNS + CloudWatch alarms)

**Files:**
- Create: `infra/modules/observability/{versions.tf,variables.tf,main.tf,outputs.tf}`
- Test: `infra/modules/observability/tests/observability.tftest.hcl`

**Interfaces:**
- Consumes:
  - Task 8: `alb_arn_suffix`, `target_group_arn_suffix`.
  - Task 3: `instance_id`.
  - Task 5: `queue_names`, `dlq_names`.
- Produces: `alarm_topic_arn` (string).

- [ ] **Step 1: Viết test fail**

`infra/modules/observability/tests/observability.tftest.hcl`:

```hcl
mock_provider "aws" {}

variables {
  env                     = "staging"
  alarm_email             = "oncall@example.com"
  alb_arn_suffix          = "app/ikf-staging-api/abc"
  target_group_arn_suffix = "targetgroup/ikf-staging-api/def"
  db_instance_id          = "ikf-staging"
  queue_names             = { relay = "ikf-staging-relay", webhooks = "ikf-staging-webhooks" }
  dlq_names               = { relay = "ikf-staging-relay-dlq", webhooks = "ikf-staging-webhooks-dlq" }
}

run "every_dlq_alarms_on_first_message" {
  command = apply

  assert {
    condition     = toset(keys(aws_cloudwatch_metric_alarm.dlq_not_empty)) == toset(["relay", "webhooks"])
    error_message = "Each DLQ needs an alarm."
  }

  assert {
    condition     = alltrue([for a in aws_cloudwatch_metric_alarm.dlq_not_empty : a.threshold == 0 && a.comparison_operator == "GreaterThanThreshold"])
    error_message = "DLQ alarm must fire on the first message."
  }
}

run "queues_alarm_when_backlog_older_than_60s" {
  command = apply

  assert {
    condition     = alltrue([for a in aws_cloudwatch_metric_alarm.queue_age : a.metric_name == "ApproximateAgeOfOldestMessage" && a.threshold == 60])
    error_message = "Queue backlog alarm must fire when the oldest message is over 60s."
  }
}

run "all_alarms_notify_the_topic" {
  command = apply

  assert {
    condition = alltrue(concat(
      [for a in aws_cloudwatch_metric_alarm.dlq_not_empty : contains(a.alarm_actions, aws_sns_topic.alarms.arn)],
      [for a in aws_cloudwatch_metric_alarm.queue_age : contains(a.alarm_actions, aws_sns_topic.alarms.arn)],
      [contains(aws_cloudwatch_metric_alarm.api_5xx_rate.alarm_actions, aws_sns_topic.alarms.arn)],
      [contains(aws_cloudwatch_metric_alarm.api_p95_latency.alarm_actions, aws_sns_topic.alarms.arn)],
      [contains(aws_cloudwatch_metric_alarm.api_no_healthy_hosts.alarm_actions, aws_sns_topic.alarms.arn)],
      [contains(aws_cloudwatch_metric_alarm.db_cpu.alarm_actions, aws_sns_topic.alarms.arn)],
      [contains(aws_cloudwatch_metric_alarm.db_free_storage.alarm_actions, aws_sns_topic.alarms.arn)],
    ))
    error_message = "Every alarm must notify the alarm topic."
  }
}
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `cd infra/modules/observability && terraform init -backend=false && terraform test`
Expected: FAIL.

- [ ] **Step 3: Implement**

`versions.tf`: giống nguyên văn `infra/modules/network/versions.tf`.

`variables.tf`:

```hcl
variable "env" {
  type = string
}

variable "alarm_email" {
  type = string
}

variable "alb_arn_suffix" {
  type = string
}

variable "target_group_arn_suffix" {
  type = string
}

variable "db_instance_id" {
  type = string
}

variable "queue_names" {
  type = map(string)
}

variable "dlq_names" {
  type = map(string)
}
```

`main.tf`:

```hcl
locals {
  prefix  = "ikf-${var.env}"
  actions = [aws_sns_topic.alarms.arn]
}

resource "aws_sns_topic" "alarms" {
  name = "${local.prefix}-alarms"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

resource "aws_cloudwatch_metric_alarm" "api_5xx_rate" {
  alarm_name          = "${local.prefix}-api-5xx-rate"
  alarm_description   = "core-api 5xx above 1% for 3 minutes"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  threshold           = 1
  treat_missing_data  = "notBreaching"
  alarm_actions       = local.actions
  ok_actions          = local.actions

  metric_query {
    id          = "rate"
    expression  = "100 * errors / MAX([requests, 1])"
    label       = "5xx %"
    return_data = true
  }

  metric_query {
    id = "errors"
    metric {
      namespace   = "AWS/ApplicationELB"
      metric_name = "HTTPCode_Target_5XX_Count"
      stat        = "Sum"
      period      = 60
      dimensions  = { LoadBalancer = var.alb_arn_suffix }
    }
  }

  metric_query {
    id = "requests"
    metric {
      namespace   = "AWS/ApplicationELB"
      metric_name = "RequestCount"
      stat        = "Sum"
      period      = 60
      dimensions  = { LoadBalancer = var.alb_arn_suffix }
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "api_p95_latency" {
  alarm_name          = "${local.prefix}-api-p95-latency"
  alarm_description   = "core-api p95 above 1s for 3 minutes"
  namespace           = "AWS/ApplicationELB"
  metric_name         = "TargetResponseTime"
  extended_statistic  = "p95"
  period              = 60
  evaluation_periods  = 3
  threshold           = 1
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  dimensions          = { LoadBalancer = var.alb_arn_suffix }
  alarm_actions       = local.actions
  ok_actions          = local.actions
}

resource "aws_cloudwatch_metric_alarm" "api_no_healthy_hosts" {
  alarm_name          = "${local.prefix}-api-no-healthy-hosts"
  namespace           = "AWS/ApplicationELB"
  metric_name         = "HealthyHostCount"
  statistic           = "Minimum"
  period              = 60
  evaluation_periods  = 2
  threshold           = 1
  comparison_operator = "LessThanThreshold"
  treat_missing_data  = "breaching"
  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.target_group_arn_suffix
  }
  alarm_actions = local.actions
  ok_actions    = local.actions
}

resource "aws_cloudwatch_metric_alarm" "db_cpu" {
  alarm_name          = "${local.prefix}-db-cpu"
  namespace           = "AWS/RDS"
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 2
  threshold           = 75
  comparison_operator = "GreaterThanThreshold"
  dimensions          = { DBInstanceIdentifier = var.db_instance_id }
  alarm_actions       = local.actions
  ok_actions          = local.actions
}

resource "aws_cloudwatch_metric_alarm" "db_free_storage" {
  alarm_name          = "${local.prefix}-db-free-storage"
  namespace           = "AWS/RDS"
  metric_name         = "FreeStorageSpace"
  statistic           = "Minimum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 10737418240
  comparison_operator = "LessThanThreshold"
  dimensions          = { DBInstanceIdentifier = var.db_instance_id }
  alarm_actions       = local.actions
  ok_actions          = local.actions
}

resource "aws_cloudwatch_metric_alarm" "dlq_not_empty" {
  for_each            = var.dlq_names
  alarm_name          = "${local.prefix}-${each.key}-dlq-not-empty"
  alarm_description   = "Messages landed in ${each.value}; inspect and redrive"
  namespace           = "AWS/SQS"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 1
  threshold           = 0
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  dimensions          = { QueueName = each.value }
  alarm_actions       = local.actions
  ok_actions          = local.actions
}

resource "aws_cloudwatch_metric_alarm" "queue_age" {
  for_each            = var.queue_names
  alarm_name          = "${local.prefix}-${each.key}-backlog"
  namespace           = "AWS/SQS"
  metric_name         = "ApproximateAgeOfOldestMessage"
  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 3
  threshold           = 60
  comparison_operator = "GreaterThanThreshold"
  treat_missing_data  = "notBreaching"
  dimensions          = { QueueName = each.value }
  alarm_actions       = local.actions
  ok_actions          = local.actions
}
```

`outputs.tf`:

```hcl
output "alarm_topic_arn" {
  value = aws_sns_topic.alarms.arn
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `terraform test`
Expected: `Success! 3 passed, 0 failed.`

- [ ] **Step 5: Commit**

```bash
git add infra/modules/observability
git commit -m "feat(infra): alarms for API, DB, queue backlog and DLQs"
```

---

### Task 12: `stack` + `envs/staging` + `envs/prod`

**Files:**
- Create: `infra/stack/{versions.tf,variables.tf,main.tf,outputs.tf}`
- Test: `infra/stack/tests/stack.tftest.hcl`
- Create: `infra/envs/staging/{main.tf,backend.tf,terraform.tfvars}`, `infra/envs/prod/{main.tf,backend.tf,terraform.tfvars}`

**Interfaces:**
- Consumes: outputs của tất cả module ở Task 2–11.
- Produces (outputs của env root, dùng ở Task 13–14 và plan edge-router):
  - `api_fqdn`, `alb_dns_name`, `ecr_repository_url`
  - `ecs_cluster`, `ecs_service`, `task_family`
  - `r2_bucket_name`, `kv_namespace_id`, `events_queue_name`
  - `turnstile_sitekey`, `nat_public_ips`

- [ ] **Step 1: Viết test fail**

`infra/stack/tests/stack.tftest.hcl`:

```hcl
mock_provider "aws" {
  mock_data "aws_iam_policy_document" {
    defaults = { json = "{\"Version\":\"2012-10-17\",\"Statement\":[]}" }
  }
  mock_resource "aws_db_instance" {
    defaults = {
      master_user_secret = [{
        secret_arn    = "arn:aws:secretsmanager:us-east-1:111111111111:secret:rds!db-test"
        kms_key_id    = "arn:aws:kms:us-east-1:111111111111:key/test"
        secret_status = "active"
      }]
    }
  }
  mock_resource "aws_acm_certificate" {
    defaults = {
      domain_validation_options = [{
        domain_name           = "api.ikf.example"
        resource_record_name  = "_abc.api.ikf.example."
        resource_record_type  = "CNAME"
        resource_record_value = "_xyz.acm-validations.aws."
      }]
    }
  }
  mock_resource "aws_sesv2_email_identity" {
    defaults = {
      dkim_signing_attributes = [{
        tokens                        = ["tok1", "tok2", "tok3"]
        current_signing_key_length    = "RSA_2048_BIT"
        next_signing_key_length       = "RSA_2048_BIT"
        signing_attributes_origin     = "AWS_SES"
        status                        = "PENDING"
        domain_signing_private_key    = null
        domain_signing_selector       = null
        last_key_generation_timestamp = ""
      }]
    }
  }
}

mock_provider "cloudflare" {
  mock_data "cloudflare_ip_ranges" {
    defaults = {
      ipv4_cidrs = ["173.245.48.0/20", "103.21.244.0/22"]
      ipv6_cidrs = []
    }
  }
}

mock_provider "random" {}

variables {
  env                   = "prod"
  region                = "us-east-1"
  azs                   = ["us-east-1a", "us-east-1b"]
  vpc_cidr              = "10.30.0.0/16"
  single_nat_gateway    = false
  db_instance_class     = "db.t4g.large"
  db_multi_az           = true
  deletion_protection   = true
  cache_node_type       = "cache.t4g.small"
  cache_replicas        = 1
  api_cpu               = 512
  api_memory            = 1024
  api_min_tasks         = 2
  api_max_tasks         = 6
  cloudflare_account_id = "acc123"
  zone_id               = "zone123"
  zone_name             = "ikf.example"
  alarm_email           = "oncall@example.com"
}

run "prod_profile_protects_data" {
  command = apply

  assert {
    condition     = module.database.multi_az && module.database.deletion_protection
    error_message = "Prod DB must be Multi-AZ with deletion protection."
  }
}

run "tasks_can_reach_db_and_cache" {
  command = apply

  assert {
    condition     = contains(module.core.task_security_group_ids, module.database.client_security_group_id) && contains(module.core.task_security_group_ids, module.cache.client_security_group_id)
    error_message = "core-api tasks must carry the DB and cache client SGs."
  }
}

run "api_is_exposed_through_cloudflare_host" {
  command = apply

  assert {
    condition     = output.api_fqdn == "api.ikf.example"
    error_message = "API must live at api.<zone>."
  }
}
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `cd infra/stack && terraform init -backend=false && terraform test`
Expected: FAIL.

- [ ] **Step 3: Implement `stack`**

`infra/stack/versions.tf`:

```hcl
terraform {
  required_version = ">= 1.10.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}
```

`infra/stack/variables.tf`:

```hcl
variable "env" {
  type = string
  validation {
    condition     = contains(["staging", "prod"], var.env)
    error_message = "env must be staging or prod."
  }
}

variable "region" {
  type = string
}

variable "azs" {
  type = list(string)
}

variable "vpc_cidr" {
  type = string
}

variable "single_nat_gateway" {
  type = bool
}

variable "db_instance_class" {
  type = string
}

variable "db_multi_az" {
  type = bool
}

variable "deletion_protection" {
  type = bool
}

variable "cache_node_type" {
  type = string
}

variable "cache_replicas" {
  type = number
}

variable "api_cpu" {
  type = number
}

variable "api_memory" {
  type = number
}

variable "api_min_tasks" {
  type = number
}

variable "api_max_tasks" {
  type = number
}

variable "cloudflare_account_id" {
  type = string
}

variable "zone_id" {
  type = string
}

variable "zone_name" {
  type = string
}

variable "alarm_email" {
  type = string
}
```

`infra/stack/main.tf`:

```hcl
locals {
  api_fqdn     = "api.${var.zone_name}"
  secret_names = ["paddle-api-key", "paddle-webhook-secret", "meta-capi-token", "adjust-s2s-token", "clickhouse-url"]
}

data "cloudflare_ip_ranges" "cf" {}

resource "random_password" "origin_auth" {
  length  = 48
  special = false
}

module "network" {
  source             = "../modules/network"
  env                = var.env
  region             = var.region
  cidr               = var.vpc_cidr
  azs                = var.azs
  single_nat_gateway = var.single_nat_gateway
}

module "database" {
  source               = "../modules/database"
  env                  = var.env
  vpc_id               = module.network.vpc_id
  subnet_ids           = module.network.database_subnet_ids
  db_subnet_group_name = module.network.database_subnet_group_name
  instance_class       = var.db_instance_class
  multi_az             = var.db_multi_az
  deletion_protection  = var.deletion_protection
}

module "cache" {
  source     = "../modules/cache"
  env        = var.env
  vpc_id     = module.network.vpc_id
  subnet_ids = module.network.private_subnet_ids
  node_type  = var.cache_node_type
  replicas   = var.cache_replicas
}

module "queues" {
  source      = "../modules/queues"
  env         = var.env
  queue_names = ["relay", "webhooks"]
}

module "security" {
  source       = "../modules/security"
  env          = var.env
  secret_names = local.secret_names
}

resource "aws_ecr_repository" "core_api" {
  name                 = "ikf-${var.env}/core-api"
  image_tag_mutability = "IMMUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "core_api" {
  repository = aws_ecr_repository.core_api.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep the last 30 images"
      selection    = { tagStatus = "any", countType = "imageCountMoreThan", countNumber = 30 }
      action       = { type = "expire" }
    }]
  })
}

resource "aws_acm_certificate" "api" {
  domain_name       = local.api_fqdn
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

locals {
  api_cert_dvo = tolist(aws_acm_certificate.api.domain_validation_options)[0]
}

resource "cloudflare_dns_record" "api_cert_validation" {
  zone_id = var.zone_id
  name    = trimsuffix(local.api_cert_dvo.resource_record_name, ".")
  type    = local.api_cert_dvo.resource_record_type
  content = trimsuffix(local.api_cert_dvo.resource_record_value, ".")
  proxied = false
  ttl     = 300
}

resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [local.api_cert_dvo.resource_record_name]
  depends_on              = [cloudflare_dns_record.api_cert_validation]
}

data "aws_iam_policy_document" "task" {
  statement {
    sid       = "Queues"
    actions   = ["sqs:SendMessage", "sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:ChangeMessageVisibility", "sqs:GetQueueAttributes"]
    resources = values(module.queues.queue_arns)
  }
  statement {
    sid       = "JwtSign"
    actions   = ["kms:Sign", "kms:GetPublicKey"]
    resources = [module.security.jwt_key_arn]
  }
  statement {
    sid       = "AppSecrets"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = values(module.security.secret_arns)
  }
  statement {
    sid       = "Email"
    actions   = ["ses:SendEmail"]
    resources = ["*"]
  }
}

module "core" {
  source                   = "../modules/core-service"
  env                      = var.env
  region                   = var.region
  vpc_id                   = module.network.vpc_id
  public_subnet_ids        = module.network.public_subnet_ids
  private_subnet_ids       = module.network.private_subnet_ids
  cloudflare_cidrs         = data.cloudflare_ip_ranges.cf.ipv4_cidrs
  origin_auth_secret       = random_password.origin_auth.result
  certificate_arn          = aws_acm_certificate_validation.api.certificate_arn
  image                    = "${aws_ecr_repository.core_api.repository_url}:bootstrap"
  cpu                      = var.api_cpu
  memory                   = var.api_memory
  min_count                = var.api_min_tasks
  max_count                = var.api_max_tasks
  extra_security_group_ids = [module.database.client_security_group_id, module.cache.client_security_group_id]
  task_policy_json         = data.aws_iam_policy_document.task.json
  secret_arns              = [module.database.master_secret_arn]
  secrets = {
    DB_USER     = "${module.database.master_secret_arn}:username::"
    DB_PASSWORD = "${module.database.master_secret_arn}:password::"
  }
  environment = {
    APP_ENV           = var.env
    NODE_ENV          = "production"
    DB_HOST           = module.database.proxy_endpoint
    REDIS_HOST        = module.cache.primary_endpoint
    RELAY_QUEUE_URL   = module.queues.queue_urls["relay"]
    WEBHOOK_QUEUE_URL = module.queues.queue_urls["webhooks"]
    JWT_KMS_KEY_ARN   = module.security.jwt_key_arn
    MAIL_FROM         = "no-reply@${module.email.mail_domain}"
    SECRETS_PREFIX    = "ikf/${var.env}/"
  }
}

module "edge" {
  source             = "../modules/edge"
  env                = var.env
  account_id         = var.cloudflare_account_id
  zone_id            = var.zone_id
  zone_name          = var.zone_name
  alb_dns_name       = module.core.alb_dns_name
  origin_auth_secret = random_password.origin_auth.result
}

module "email" {
  source      = "../modules/email"
  zone_id     = var.zone_id
  mail_domain = "mail.${var.zone_name}"
}

module "observability" {
  source                  = "../modules/observability"
  env                     = var.env
  alarm_email             = var.alarm_email
  alb_arn_suffix          = module.core.alb_arn_suffix
  target_group_arn_suffix = module.core.target_group_arn_suffix
  db_instance_id          = module.database.instance_id
  queue_names             = module.queues.queue_names
  dlq_names               = module.queues.dlq_names
}

# Generated at the edge, so Terraform is the only place that knows it.
resource "aws_secretsmanager_secret" "turnstile" {
  name                    = "ikf/${var.env}/turnstile-secret"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "turnstile" {
  secret_id     = aws_secretsmanager_secret.turnstile.id
  secret_string = module.edge.turnstile_secret
}
```

`infra/stack/outputs.tf`:

```hcl
output "api_fqdn" {
  value = module.edge.api_fqdn
}

output "alb_dns_name" {
  value = module.core.alb_dns_name
}

output "ecr_repository_url" {
  value = aws_ecr_repository.core_api.repository_url
}

output "ecs_cluster" {
  value = module.core.cluster_name
}

output "ecs_service" {
  value = module.core.service_name
}

output "task_family" {
  value = module.core.task_family
}

output "r2_bucket_name" {
  value = module.edge.r2_bucket_name
}

output "kv_namespace_id" {
  value = module.edge.kv_namespace_id
}

output "events_queue_name" {
  value = module.edge.events_queue_name
}

output "turnstile_sitekey" {
  value = module.edge.turnstile_sitekey
}

output "nat_public_ips" {
  value = module.network.nat_public_ips
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `terraform init -backend=false -upgrade && terraform test`
Expected: `Success! 3 passed, 0 failed.`

- [ ] **Step 5: Tạo env roots**

`infra/envs/staging/main.tf` (file `infra/envs/prod/main.tf` giống hệt, chỉ khác `backend.tf` và `terraform.tfvars`):

```hcl
terraform {
  required_version = ">= 1.10.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

variable "env" { type = string }
variable "region" { type = string }
variable "azs" { type = list(string) }
variable "vpc_cidr" { type = string }
variable "single_nat_gateway" { type = bool }
variable "db_instance_class" { type = string }
variable "db_multi_az" { type = bool }
variable "deletion_protection" { type = bool }
variable "cache_node_type" { type = string }
variable "cache_replicas" { type = number }
variable "api_cpu" { type = number }
variable "api_memory" { type = number }
variable "api_min_tasks" { type = number }
variable "api_max_tasks" { type = number }

# Set via TF_VAR_* (GitHub environment variables / local shell), not committed.
variable "cloudflare_account_id" { type = string }
variable "zone_id" { type = string }
variable "zone_name" { type = string }
variable "alarm_email" { type = string }

provider "aws" {
  region = var.region
  default_tags {
    tags = { project = "ikf", env = var.env, managed_by = "terraform" }
  }
}

# Reads CLOUDFLARE_API_TOKEN from the environment.
provider "cloudflare" {}

module "stack" {
  source                = "../../stack"
  env                   = var.env
  region                = var.region
  azs                   = var.azs
  vpc_cidr              = var.vpc_cidr
  single_nat_gateway    = var.single_nat_gateway
  db_instance_class     = var.db_instance_class
  db_multi_az           = var.db_multi_az
  deletion_protection   = var.deletion_protection
  cache_node_type       = var.cache_node_type
  cache_replicas        = var.cache_replicas
  api_cpu               = var.api_cpu
  api_memory            = var.api_memory
  api_min_tasks         = var.api_min_tasks
  api_max_tasks         = var.api_max_tasks
  cloudflare_account_id = var.cloudflare_account_id
  zone_id               = var.zone_id
  zone_name             = var.zone_name
  alarm_email           = var.alarm_email
}

output "api_fqdn" { value = module.stack.api_fqdn }
output "alb_dns_name" { value = module.stack.alb_dns_name }
output "ecr_repository_url" { value = module.stack.ecr_repository_url }
output "ecs_cluster" { value = module.stack.ecs_cluster }
output "ecs_service" { value = module.stack.ecs_service }
output "task_family" { value = module.stack.task_family }
output "r2_bucket_name" { value = module.stack.r2_bucket_name }
output "kv_namespace_id" { value = module.stack.kv_namespace_id }
output "events_queue_name" { value = module.stack.events_queue_name }
output "turnstile_sitekey" { value = module.stack.turnstile_sitekey }
output "nat_public_ips" { value = module.stack.nat_public_ips }
```

`infra/envs/staging/backend.tf`:

```hcl
terraform {
  backend "s3" {
    key          = "staging/stack.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
```

`infra/envs/prod/backend.tf`: như trên, nhưng `key = "prod/stack.tfstate"`.

`infra/envs/staging/terraform.tfvars`:

```hcl
env                 = "staging"
region              = "us-east-1"
azs                 = ["us-east-1a", "us-east-1b"]
vpc_cidr            = "10.20.0.0/16"
single_nat_gateway  = true
db_instance_class   = "db.t4g.medium"
db_multi_az         = false
deletion_protection = false
cache_node_type     = "cache.t4g.micro"
cache_replicas      = 0
api_cpu             = 256
api_memory          = 512
api_min_tasks       = 1
api_max_tasks       = 2
```

`infra/envs/prod/terraform.tfvars`:

```hcl
env                 = "prod"
region              = "us-east-1"
azs                 = ["us-east-1a", "us-east-1b"]
vpc_cidr            = "10.30.0.0/16"
single_nat_gateway  = false
db_instance_class   = "db.t4g.large"
db_multi_az         = true
deletion_protection = true
cache_node_type     = "cache.t4g.small"
cache_replicas      = 1
api_cpu             = 512
api_memory          = 1024
api_min_tasks       = 2
api_max_tasks       = 6
```

- [ ] **Step 6: Validate cả hai env**

Run:
```bash
for e in staging prod; do (cd infra/envs/$e && terraform init -backend=false && terraform validate); done
```
Expected: `Success! The configuration is valid.` hai lần.

- [ ] **Step 7: Commit**

```bash
terraform fmt -recursive infra
git add infra/stack infra/envs
git commit -m "feat(infra): compose stack and staging/prod roots"
```

---

### Task 13: CI/CD (GitHub Actions)

**Files:**
- Create: `.github/workflows/infra.yml`, `.github/workflows/core-api.yml`
- Create: `scripts/deploy-core-api.sh`

**Interfaces:**
- Consumes:
  - GitHub environment variables (cho cả `staging` và `prod`): `AWS_ROLE_ARN` (từ output bootstrap), `TF_STATE_BUCKET`, `TF_VAR_cloudflare_account_id`, `TF_VAR_zone_id`, `TF_VAR_zone_name`, `TF_VAR_alarm_email`, `ECR_REPOSITORY_URL`, `ECS_CLUSTER`, `ECS_SERVICE`, `TASK_FAMILY`, `API_HOST`.
  - Secret: `CLOUDFLARE_API_TOKEN`.
- Produces:
  - Quy trình infra: PR → check + plan staging; merge `main` → apply staging rồi prod (prod cần duyệt).
  - Quy trình app: merge `main` → deploy staging rồi prod (prod cần duyệt).

- [ ] **Step 1: Viết `infra.yml`**

```yaml
name: infra

on:
  pull_request:
    paths: ["infra/**", ".github/workflows/infra.yml", ".tflint.hcl", ".trivyignore"]
  push:
    branches: [main]
    paths: ["infra/**", ".github/workflows/infra.yml"]

permissions:
  contents: read
  id-token: write

env:
  TF_VERSION: "1.13.3"
  AWS_REGION: us-east-1

jobs:
  static:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}
      - run: terraform fmt -check -recursive infra
      - name: Modules must not hold secret values
        run: |
          if grep -rn "aws_secretsmanager_secret_version" infra/modules; then
            echo "Secret values belong in the console/CLI, not in modules"; exit 1
          fi
      - uses: terraform-linters/setup-tflint@v4
      - run: tflint --init && tflint --recursive --config "$GITHUB_WORKSPACE/.tflint.hcl"
      - uses: aquasecurity/trivy-action@0.28.0
        with:
          scan-type: config
          scan-ref: infra
          severity: HIGH,CRITICAL
          exit-code: "1"
          trivyignores: .trivyignore

  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        dir:
          - infra/bootstrap
          - infra/modules/network
          - infra/modules/database
          - infra/modules/cache
          - infra/modules/queues
          - infra/modules/security
          - infra/modules/core-service
          - infra/modules/edge
          - infra/modules/email
          - infra/modules/observability
          - infra/stack
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}
      - run: terraform init -backend=false && terraform test
        working-directory: ${{ matrix.dir }}

  plan-staging:
    if: github.event_name == 'pull_request'
    needs: [static, test]
    runs-on: ubuntu-latest
    environment: staging
    env:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      TF_VAR_cloudflare_account_id: ${{ vars.TF_VAR_cloudflare_account_id }}
      TF_VAR_zone_id: ${{ vars.TF_VAR_zone_id }}
      TF_VAR_zone_name: ${{ vars.TF_VAR_zone_name }}
      TF_VAR_alarm_email: ${{ vars.TF_VAR_alarm_email }}
    defaults:
      run:
        working-directory: infra/envs/staging
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}
      - run: terraform init -input=false -backend-config="bucket=${{ vars.TF_STATE_BUCKET }}"
      - run: terraform plan -input=false -no-color | tee plan.txt
      - run: tail -n 40 plan.txt >> "$GITHUB_STEP_SUMMARY"

  apply:
    if: github.event_name == 'push'
    needs: [static, test]
    runs-on: ubuntu-latest
    strategy:
      max-parallel: 1
      matrix:
        env: [staging, prod]
    environment: ${{ matrix.env }}
    env:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      TF_VAR_cloudflare_account_id: ${{ vars.TF_VAR_cloudflare_account_id }}
      TF_VAR_zone_id: ${{ vars.TF_VAR_zone_id }}
      TF_VAR_zone_name: ${{ vars.TF_VAR_zone_name }}
      TF_VAR_alarm_email: ${{ vars.TF_VAR_alarm_email }}
    defaults:
      run:
        working-directory: infra/envs/${{ matrix.env }}
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}
      - run: terraform init -input=false -backend-config="bucket=${{ vars.TF_STATE_BUCKET }}"
      - run: terraform apply -input=false -auto-approve
      - run: ../../../scripts/smoke.sh "${{ vars.API_HOST }}" "${{ matrix.env }}"
```

- [ ] **Step 2: Viết `scripts/deploy-core-api.sh`**

```bash
#!/usr/bin/env bash
# Roll core-api to a new image, keeping env/secrets from the newest revision of the family
# (which is the Terraform-managed one after any infra change).
set -euo pipefail

CLUSTER="$1"
SERVICE="$2"
FAMILY="$3"
IMAGE="$4"

aws ecs describe-task-definition --task-definition "$FAMILY" --query taskDefinition > td.json
jq --arg img "$IMAGE" '
  .containerDefinitions |= map(if .name == "core-api" then .image = $img else . end)
  | del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)
' td.json > td-new.json

NEW_ARN=$(aws ecs register-task-definition --cli-input-json file://td-new.json \
  --query taskDefinition.taskDefinitionArn --output text)
aws ecs update-service --cluster "$CLUSTER" --service "$SERVICE" --task-definition "$NEW_ARN" > /dev/null
aws ecs wait services-stable --cluster "$CLUSTER" --services "$SERVICE"
echo "deployed $NEW_ARN"
```

Run: `chmod +x scripts/deploy-core-api.sh`

- [ ] **Step 3: Viết `core-api.yml`**

```yaml
name: core-api

on:
  pull_request:
    paths: ["services/core-api/**", ".github/workflows/core-api.yml"]
  push:
    branches: [main]
    paths: ["services/core-api/**", ".github/workflows/core-api.yml"]

permissions:
  contents: read
  id-token: write

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: services/core-api
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: services/core-api/package-lock.json
      - run: npm ci
      - run: npm test

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
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ vars.AWS_ROLE_ARN }}
          aws-region: us-east-1
      - uses: aws-actions/amazon-ecr-login@v2
      - uses: docker/setup-qemu-action@v3
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v6
        with:
          context: services/core-api
          platforms: linux/arm64
          push: true
          tags: ${{ vars.ECR_REPOSITORY_URL }}:${{ github.sha }}
      - run: scripts/deploy-core-api.sh "${{ vars.ECS_CLUSTER }}" "${{ vars.ECS_SERVICE }}" "${{ vars.TASK_FAMILY }}" "${{ vars.ECR_REPOSITORY_URL }}:${{ github.sha }}"
      - run: scripts/smoke.sh "${{ vars.API_HOST }}" "${{ matrix.env }}"
```

- [ ] **Step 4: Lint workflow**

Run: `docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest`
Expected: không có lỗi.

- [ ] **Step 5: Commit**

```bash
git add .github scripts/deploy-core-api.sh
git commit -m "ci: terraform checks/plan/apply and core-api build+deploy"
```

---

### Task 14: Dựng staging → smoke → load test → DR drill → prod

**Files:**
- Create: `scripts/smoke.sh`, `loadtest/tier-a.js`

**Interfaces:**
- Consumes: mọi output của Task 12, các workflow của Task 13.
- Produces: staging và prod chạy thật; số liệu k6 ghi vào `loadtest/RESULTS.md`.

- [ ] **Step 1: Viết smoke test (sẽ fail vì chưa có môi trường)**

`scripts/smoke.sh`:

```bash
#!/usr/bin/env bash
# Usage: scripts/smoke.sh <api-host> <env>
set -euo pipefail
HOST="$1"
ENV_NAME="$2"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "1) livez through Cloudflare"
curl -fsS --max-time 10 "https://$HOST/livez" | grep -q '"status":"ok"'

echo "2) healthz through Cloudflare (DB + cache reachable)"
body=$(curl -sS --max-time 10 "https://$HOST/healthz")
echo "$body"
echo "$body" | grep -q '"status":"ok"'

echo "3) ALB must refuse direct traffic"
ALB=$(terraform -chdir="$ROOT/infra/envs/$ENV_NAME" output -raw alb_dns_name)
code=$(curl -sk --max-time 8 -o /dev/null -w '%{http_code}' "https://$ALB/livez" || true)
if [ "$code" = "200" ]; then
  echo "FAIL: ALB answered 200 without Cloudflare"; exit 1
fi
echo "direct ALB returned '$code' (timeout=000 or 403 expected)"

echo "smoke ok"
```

Run: `chmod +x scripts/smoke.sh && scripts/smoke.sh api.<staging-domain> staging`
Expected: FAIL ở bước 1 (host chưa tồn tại).

- [ ] **Step 2: Apply bootstrap (máy local, quyền admin)**

```bash
cd infra/bootstrap
terraform init
terraform apply -var state_bucket_name=ikf-tfstate-<AWS_ACCOUNT_ID> -var github_repo=<org>/ikf-platform
terraform output
```

Ghi `gha_role_arns` và `state_bucket` vào GitHub environment variables (`AWS_ROLE_ARN`, `TF_STATE_BUCKET`), cùng các biến `TF_VAR_*` và secret `CLOUDFLARE_API_TOKEN` (Task 0). State của bootstrap để local, cất vào password manager của team. Không commit state.

- [ ] **Step 3: Apply staging lần đầu (theo thứ tự, vì service cần image `bootstrap`)**

```bash
cd infra/envs/staging
export CLOUDFLARE_API_TOKEN=... TF_VAR_cloudflare_account_id=... TF_VAR_zone_id=... TF_VAR_zone_name=... TF_VAR_alarm_email=...
terraform init -backend-config="bucket=ikf-tfstate-<AWS_ACCOUNT_ID>"
terraform apply -target=module.stack.aws_ecr_repository.core_api
REPO=$(terraform output -raw ecr_repository_url)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "${REPO%%/*}"
docker buildx build --platform linux/arm64 -t "$REPO:bootstrap" --push ../../../services/core-api
terraform apply
```

Expected: apply thành công. Nhóm on-call nhận email xác nhận đăng ký SNS, cần bấm confirm.

- [ ] **Step 4: Chạy smoke, xác nhận PASS**

Run: `scripts/smoke.sh "$(terraform -chdir=infra/envs/staging output -raw api_fqdn)" staging`
Expected: `smoke ok`. Bước 3 trả về `000` (timeout do SG) hoặc `403`.

- [ ] **Step 5: Load test**

`loadtest/tier-a.js`:

```js
import http from 'k6/http';
import { check } from 'k6';

// Tier A core peak ≈ 5 rps; test at 10× with a burst shape like a campaign launch.
export const options = {
  scenarios: {
    burst: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 200,
      stages: [
        { target: 50, duration: '1m' },
        { target: 50, duration: '5m' },
        { target: 5, duration: '1m' },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.001'],
    http_req_duration: ['p(95)<300'],
  },
};

export default function () {
  const res = http.get(`https://${__ENV.API_HOST}/healthz`);
  check(res, { 'status 200': (r) => r.status === 200 });
}
```

Run: `k6 run -e API_HOST=$(terraform -chdir=infra/envs/staging output -raw api_fqdn) loadtest/tier-a.js`
Expected: cả hai threshold đạt (`✓ http_req_failed`, `✓ http_req_duration`). Nếu Cloudflare chặn hoặc challenge k6, tạm thêm WAF skip rule cho IP chạy test trong dashboard rồi xóa sau khi xong. Ghi p95, số lỗi, số task tối đa (xem trên ECS console) và `DatabaseConnections` cao nhất vào `loadtest/RESULTS.md`.

- [ ] **Step 6: DR drill (staging)**

```bash
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier ikf-staging \
  --target-db-instance-identifier ikf-staging-drill \
  --use-latest-restorable-time \
  --db-subnet-group-name ikf-staging \
  --no-multi-az --no-publicly-accessible
aws rds wait db-instance-available --db-instance-identifier ikf-staging-drill
aws rds describe-db-instances --db-instance-identifier ikf-staging-drill --query 'DBInstances[0].DBInstanceStatus'
aws rds delete-db-instance --db-instance-identifier ikf-staging-drill --skip-final-snapshot
```

Expected: trạng thái `"available"`. Ghi lại thời gian restore (đây là RTO thực tế) vào `loadtest/RESULTS.md`.

- [ ] **Step 7: ClickHouse Cloud + nhập secret**

1. Tạo service ClickHouse Cloud ở **AWS us-east-1**, gói nhỏ nhất. IP access list chỉ gồm `nat_public_ips` của prod và staging.
2. Nhập giá trị thật cho các secret:

```bash
for s in paddle-api-key paddle-webhook-secret meta-capi-token adjust-s2s-token clickhouse-url; do
  read -rsp "staging $s: " v; echo
  aws secretsmanager put-secret-value --secret-id "ikf/staging/$s" --secret-string "$v"
done
```

Paddle dùng key sandbox cho staging. Làm lại cho prod khi tới Step 9.

3. Gửi yêu cầu **SES production access** (AWS console → SES → Account dashboard → Request production access), use case "transactional OTP and magic links".

- [ ] **Step 8: Commit và đưa CI vào vận hành**

```bash
git add scripts/smoke.sh loadtest
git commit -m "test: smoke and Tier A load test, staging results"
git remote add origin git@github.com:<org>/ikf-platform.git
git push -u origin main
```

Expected: workflow `infra` chạy apply staging (không có thay đổi), smoke pass, rồi chờ duyệt prod.

- [ ] **Step 9: Prod**

1. Trước khi duyệt job prod trong GitHub, push image bootstrap cho prod giống Step 3. Dùng `-target` ECR với `infra/envs/prod`, tự chạy local bằng role admin.
2. Duyệt job `apply (prod)`. Expected: apply thành công, `smoke ok`.
3. Nhập secret prod như Step 7 (Paddle live key).
4. Xác nhận email SNS của prod.

---

## Self-Review

- **Spec coverage:** đã đối chiếu với master plan §12:
  - Cloudflare edge (Task 9)
  - Core compute autoscale (Task 8)
  - Postgres HA + pooling (Task 3)
  - Cache (Task 4)
  - Queue + DLQ (Task 5)
  - ClickHouse (Task 14 Step 7)
  - Email (Task 10)
  - Secrets/KMS (Task 6)
  - Observability (Task 11)
  - CI/CD + IaC (Task 1, 13)
  - Chống bot/rate limit (Task 9)
  - DR (Task 14 Step 6)
  - Load test 10× (Task 14 Step 5)
- **Ngoài phạm vi, thuộc plan sau:**
  - Code Worker (edge router, collector): `…-edge-router-publisher.md`, `…-runtime-sdk-collector.md`
  - Event consumer từ Cloudflare Queues sang ClickHouse
  - Sentry
  - Siết quyền role GitHub (đang để admin)
- **Rủi ro schema:** test của Cloudflare provider v5 và mock của SES/ACM có thể cần chỉnh tên thuộc tính theo phiên bản provider thực tế. Task 9 và 10 đã ghi cách xử lý: sửa theo `terraform validate`, không được xóa assert.

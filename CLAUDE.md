# GiveLedger — Claude Code Context

Multi-tenant giving campaign tracker for churches. Each church is an independent **tenant** — data is never shared across tenants.

**Stack:** PHP 8.3 (pure, no Laravel/Symfony) + PDO · MySQL · Vue 3 + TypeScript (Nuxt 3) · Docker

---

## How to Work With Me

**Always plan before acting.** For every task:

1. Read the relevant skill file(s) from `.claude/skills/` first
2. Show a plan: files to create/modify, layer they belong to, order of execution
3. Wait for approval before writing any code
4. If I push back or change something, update the plan and confirm again before proceeding

**Plan format:**
```
## Plan: [task name]

Files to create/modify (in order):
1. `path/to/File.php` — [layer] — [what it does]
2. `path/to/Other.php` — [layer] — [what it does]

Decisions made:
- [any non-obvious choice and why]

Questions (if any):
- [only ask if genuinely ambiguous — max 1-2]

Proceed?
```

Never write code before the user says yes (or "ok", "dale", "adelante", "go").

---

## Project Structure

```
giveledger/
├── app/
│   ├── Application/Campaign/     # Commands + Handlers
│   ├── Application/Auth/         # LoginCommand + LoginHandler
│   ├── Domain/
│   │   ├── Campaign/             # Aggregate, Entities, VOs, Interface
│   │   ├── Auth/                 # User entity, UserRepositoryInterface
│   │   └── Shared/               # TenantId, Money, TenantMismatchException
│   └── Infrastructure/
│       ├── Application/          # HandlerBus
│       ├── Domain/               # CampaignRepository, UserRepository (PDO)
│       ├── HTTP/Controller/
│       │   ├── Campaign/         # CampaignController
│       │   ├── Donation/         # DonationController
│       │   └── Auth/             # AuthController
│       ├── HTTP/Middleware/      # TenantResolver, AuthMiddleware
│       ├── Query/                # CampaignFinder, TenantFinder
│       └── Api/Resource/
├── config/
│   ├── handlers.php              # Command → Handler map
│   └── routes.php
├── db/migrations/
│   ├── 001_create_tenants.sql
│   ├── 002_create_campaigns.sql
│   ├── 003_create_donations.sql
│   └── 004_create_users.sql
├── frontend/                     # Nuxt 3 app
│   ├── pages/
│   │   ├── index.vue             # Tenant/church selector
│   │   ├── donate/
│   │   │   └── [slug].vue        # Campaign list for a tenant
│   │   ├── admin/
│   │   │   └── index.vue         # Login page
│   │   └── [slug]/
│   │       ├── dashboard.vue     # Admin panel
│   │       └── campaigns/
│   │           └── new.vue
│   ├── components/
│   ├── composables/
│   ├── middleware/               # auth.ts — protects /:slug/* routes
│   ├── stores/                   # auth.ts Pinia store
│   ├── queries/
│   ├── types/
│   └── i18n/en.json
├── docker/
│   ├── php/ · nginx/ · vue/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── docs/deployment.md
```

---

## Domain Rules (enforced inside the aggregate — never in controllers)

1. Donation on a **closed** campaign → throws inside `Campaign::recordDonation()`
2. Campaign cannot close before **goal is reached** → `guardGoalReached()`
3. Campaign cannot close before **deadline** → `guardDeadlinePassed()`
4. Donation amount must be **> 0** → enforced in `Money` VO
5. Campaign name: **3–100 chars** → enforced in `CampaignName` VO
6. All operations scoped to tenant — cross-tenant mutation throws `TenantMismatchException`

---

## Architecture Rules — NEVER violate these

```
Domain ← Application ← Infrastructure
```

- **Domain**: zero external imports. No `use Doctrine\`, no `use Laravel\`. Pure PHP only.
- **Application (Handlers)**: depends only on Domain interfaces. Wraps raw strings into VOs. No HTTP awareness.
- **Infrastructure**: the only layer that touches frameworks, PDO, HTTP.
- **Commands**: primitive fields only (`string`, `int`, `bool`). No VOs, no domain objects.
- **Finders**: return plain arrays. Never entities or VOs. Read-path only.
- **Repositories**: `findById()` and `save()`. SQL lives only here.
- **TenantId VO**: constructed only inside Domain (in Handler or Aggregate). Infrastructure passes raw string.
- **Controller**: resolves tenant → builds Command → dispatches to HandlerBus. Zero business logic.

---

## Value Objects

All VOs: immutable, validate on construction, throw typed domain exception on invalid input.

| Class | Validates | Location |
|-------|-----------|----------|
| `TenantId` | UUID v4 format | `Domain/Shared/` |
| `Money` | amount > 0, known currency | `Domain/Shared/` |
| `CampaignId` | UUID v4 format | `Domain/Campaign/` |
| `DonationId` | UUID v4 format | `Domain/Campaign/` |
| `CampaignName` | 3–100 chars, non-blank | `Domain/Campaign/` |
| `DonorName` | 2–80 chars, non-blank | `Domain/Campaign/` |
| `CampaignStatus` | enum: `open`\|`closed` | `Domain/Campaign/` |

**Money precision:** integers in cents (`$10.00 = 1000`). Never floats. Expose `toCents(): int` and `format(): string`.

VO pattern:
```php
final class SomeId {
    private function __construct(private readonly string $value) {
        // validate, throw \InvalidArgumentException on bad input
    }
    public static function of(string $value): self { return new self($value); }
    public function equals(self $other): bool { return $this->value === $other->value; }
    public function value(): string { return $this->value; }
}
```

---

## Campaign Aggregate — Invariant Guards

```php
guardTenant(TenantId $t)  // throws TenantMismatchException if tenant doesn't match
guardOpen()               // throws if status === closed
guardGoalReached()        // throws if raised < goal
guardDeadlinePassed()     // throws if now < deadline
```

`Donation` is a child entity — never accessed directly, only through `Campaign::recordDonation()`.

---

## Application Layer — Commands & Handlers

Commands carry only primitives. Handlers build VOs, call aggregate, persist.

| Command | Fields |
|---------|--------|
| `CreateCampaignCommand` | `tenantId`, `campaignId`, `name`, `goalCents`, `currency`, `deadline` |
| `RecordDonationCommand` | `tenantId`, `campaignId`, `donationId`, `donorName`, `amountCents`, `currency` |
| `CloseCampaignCommand` | `tenantId`, `campaignId` |
| `LoginCommand` | `email`, `password` |

`config/handlers.php` maps `CommandClass::class => HandlerClass::class`.

---

## Auth Design

### Users table
```sql
users(id CHAR(36) PK, tenant_id CHAR(36) FK, email VARCHAR(255) UNIQUE,
      password_hash VARCHAR(255), role VARCHAR(50), created_at DATETIME)
```

### Auth flow
1. Staff POSTs `email + password` to `POST /api/auth/login`
2. `AuthController` dispatches `LoginCommand` → `LoginHandler` verifies credentials
3. On success: server returns a **token** (opaque random token stored in `auth_tokens` table, or JWT)
4. Frontend stores token in Pinia store, sends as `Authorization: Bearer <token>` on admin requests
5. `AuthMiddleware` on all `/:slug/*` API routes: validates token → extracts `tenant_id` + `slug`

### Tenant resolution — two strategies, never mixed

| Route type | Tenant comes from |
|------------|------------------|
| Public (`/api/donate/:slug/*`) | URL slug → looked up in `tenants` table |
| Admin (`/api/:slug/*`) | Auth token → `tenant_id` embedded in token/session |

### URL slug security rule
Admin routes receive the slug in the URL **for cosmetic/UX purposes only**.
The middleware compares URL slug against the token's tenant slug.
Mismatch → **403 Forbidden**. The slug in the URL never grants access by itself.

### Frontend auth routes
| Route | Access | Purpose |
|-------|--------|---------|
| `/` | public | Church selector (list of tenants) |
| `/donate/:slug` | public | Campaigns for that church |
| `/donate/:slug/:campaignId` | public | Donation form |
| `/admin` | public | Staff login page |
| `/:slug/dashboard` | auth | Admin panel — campaigns overview |
| `/:slug/campaigns/new` | auth | Create campaign form |

Frontend `middleware/auth.ts` guards all `/:slug/*` routes — redirects to `/admin` if no valid token.

---

## Multi-Tenancy

- Shared database, scoped queries — every tenant table has `tenant_id` column
- Public routes: `TenantResolver` looks up slug from URL → returns raw `tenant_id` string → 404 if unknown
- Admin routes: `AuthMiddleware` extracts `tenant_id` from token — no URL lookup needed
- Every repository method receives `TenantId` argument — no global state
- Raw string flows through Command → Handler wraps it in `TenantId::of()`

---

## Database Schema

```sql
tenants(id CHAR(36) PK, slug VARCHAR(50) UNIQUE, name VARCHAR(100), created_at)

campaigns(id CHAR(36) PK, tenant_id CHAR(36), name VARCHAR(100), goal_cents INT UNSIGNED,
          currency CHAR(3), status ENUM('open','closed') DEFAULT 'open', deadline DATE, created_at)

donations(id CHAR(36) PK, campaign_id CHAR(36) FK, donor_name VARCHAR(80),
          amount_cents INT UNSIGNED, recorded_at DATETIME)

users(id CHAR(36) PK, tenant_id CHAR(36) FK, email VARCHAR(255) UNIQUE,
      password_hash VARCHAR(255), role VARCHAR(50), created_at DATETIME)

auth_tokens(id CHAR(36) PK, user_id CHAR(36) FK, token VARCHAR(255) UNIQUE,
            expires_at DATETIME, created_at DATETIME)
```

---

## Skills

For detailed patterns, refer to:
- `.claude/skills/backend.md` — DDD/hexagonal PHP patterns, VO/Entity/Aggregate/Handler examples
- `.claude/skills/frontend.md` — Vue 3 + TypeScript Tithely standards
- `.claude/skills/devops.md` — Docker multi-stage, nginx config, deploy steps

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

## Dev Setup

```bash
cp .env.example .env        # first time only
./localhost.sh up           # build + start + migrate + seed + wait for Nuxt
./localhost.sh down         # stop everything
./localhost.sh logs [svc]   # tail logs (svc optional: php-fpm, vue, nginx, mysql, redis)
```

App runs at **http://localhost**. Seed data: tenants `grace-church` and `hope-chapel`.
PHP-FPM pool is set to `pm.max_children = 50` (`docker/php/www.conf`) to handle SSE connections.

---

## Project Structure

```
giveledger/
├── app/
│   ├── Application/
│   │   ├── Auth/             LoginCommand+Handler, LogoutCommand+Handler,
│   │   │                     RegisterUserCommand+Handler
│   │   └── Campaign/         CreateCampaignCommand+Handler, RecordDonationCommand+Handler,
│   │                         CloseCampaignCommand+Handler
│   ├── Domain/
│   │   ├── Campaign/         Campaign (aggregate), Donation (entity), CampaignId,
│   │   │                     DonationId, CampaignName, DonorName, CampaignStatus,
│   │   │                     CampaignRepositoryInterface, CampaignNotFoundException
│   │   ├── Auth/             User, UserRepositoryInterface, TokenStorageInterface,
│   │   │                     EmailAlreadyRegisteredException
│   │   └── Shared/           TenantId, Money, TenantMismatchException,
│   │                         EventBusInterface, Event/{CampaignCreated,
│   │                         CampaignClosed, DonationRecorded}
│   └── Infrastructure/
│       ├── Application/      HandlerBus
│       ├── Domain/           CampaignRepository, UserRepository, TokenStorage
│       ├── Event/            RedisEventBus, NullEventBus
│       ├── HTTP/
│       │   ├── Controller/   AuthController, CampaignController, DonationController,
│       │   │                 TenantController, StreamController
│       │   └── Middleware/   TenantResolver, AuthMiddleware + exceptions
│       ├── Query/            CampaignFinder, DonationFinder, TenantFinder
│       └── Api/Resource/     CampaignResource
├── config/
│   ├── handlers.php          Command → Handler map
│   └── routes.php            All API routes with middleware type
├── db/
│   ├── migrations/           001–006 (tables + idx_campaigns_tenant_status)
│   └── seeds/dev.sql         Two tenants (grace-church, hope-chapel)
├── frontend/
│   ├── components/
│   │   ├── common/           BaseButton, BaseInput, BaseTextarea, BaseSelect,
│   │   │                     BaseBadge, BaseModal, BaseTable, ProgressBar,
│   │   │                     AlertBanner, AuthCard, AppHeader
│   │   ├── campaign/         CampaignCard, CampaignForm, DonationForm,
│   │   │                     ConfirmDonationModal, ConfirmOpenModal, ConfirmCloseModal,
│   │   │                     CampaignTable/{index,Header,Body,Footer},
│   │   │                     DonorTable/{index,Header,Body,Footer}
│   │   └── tenant/           TenantCard
│   ├── composables/          useApi.ts, useCurrency.ts, useSse.ts
│   ├── layouts/              default.vue (AppHeader + <slot>)
│   ├── middleware/           auth.ts (client-only, restore + redirect)
│   ├── pages/
│   │   ├── index.vue                         public — tenant selector + admin footer
│   │   ├── donate/[slug]/index.vue           public — open campaigns list
│   │   ├── donate/[slug]/[campaignId].vue    public — donation form
│   │   ├── admin/index.vue                   public — staff login
│   │   ├── admin/register.vue                public — staff register
│   │   ├── [slug]/dashboard.vue              admin — campaign table + SSE
│   │   ├── [slug]/campaigns/new.vue          admin — create campaign
│   │   └── [slug]/campaigns/[id]/donors.vue  admin — donor list for a campaign
│   ├── plugins/              i18n.ts
│   ├── stores/               auth.ts, campaigns.ts, tenants.ts
│   ├── types/                campaign.ts (Tenant, Campaign, Donation, payloads)
│   └── utils/                apiError.ts
├── docker/
│   ├── php/   Dockerfile, entrypoint.sh, www.conf
│   ├── nginx/ Dockerfile, nginx.conf
│   └── vue/   Dockerfile (dev + build + runtime stages)
├── docker-compose.yml
├── docker-compose.prod.yml
├── localhost.sh              dev helper (up / down / logs)
└── .env.example
```

---

## Domain Rules (enforced inside the aggregate)

1. Donation on a **closed** campaign → throws inside `Campaign::recordDonation()`
2. Donation amount must be **> 0** → enforced in `Money` VO
3. Campaign name: **3–100 chars** → enforced in `CampaignName` VO
4. Campaign **deadline must be at least tomorrow** → enforced in `Campaign::create()`
5. All operations scoped to tenant — cross-tenant mutation throws `TenantMismatchException`
6. **No two open campaigns with the same name** per tenant → checked in `CreateCampaignHandler` via `existsOpenWithName()`
7. **Auto-close**: `CampaignFinder::autoClose()` runs before every SELECT and closes open campaigns where `deadline < TODAY OR raised >= goal`
8. **Admin force-close**: `Campaign::forceClose()` closes without goal/deadline guards — only checks tenant + open status

---

## Architecture Rules — NEVER violate these

```
Domain ← Application ← Infrastructure
```

- **Domain**: zero external imports. Pure PHP only.
- **Application (Handlers)**: depends only on Domain interfaces. Wraps raw strings into VOs. No HTTP awareness.
- **Infrastructure**: the only layer that touches frameworks, PDO, HTTP.
- **Commands**: primitive fields only (`string`, `int`, `bool`). No VOs.
- **Finders**: return plain arrays. Never entities. Read-path only. May run writes (autoClose) as a pragmatic side-effect.
- **Repositories**: `findById()`, `save()`, `existsOpenWithName()`. SQL lives only here.
- **Controller**: resolves tenant → builds Command → dispatches to HandlerBus. Zero business logic.

---

## Value Objects

| Class | Validates | Location |
|-------|-----------|----------|
| `TenantId` | UUID v4 | `Domain/Shared/` |
| `Money` | amount > 0, known currency | `Domain/Shared/` |
| `CampaignId` | UUID v4 | `Domain/Campaign/` |
| `DonationId` | UUID v4 | `Domain/Campaign/` |
| `CampaignName` | 3–100 chars, non-blank | `Domain/Campaign/` |
| `DonorName` | 2–80 chars, non-blank | `Domain/Campaign/` |
| `CampaignStatus` | enum: `open`\|`closed` | `Domain/Campaign/` |

**Money precision:** integers in cents. `toCents(): int` and `format(): string`. Never floats.

---

## HTTP Layer

### Routes (`config/routes.php`)

| Method | Pattern | Middleware | Action |
|--------|---------|-----------|--------|
| POST | `/api/auth/login` | public | `AuthController::login` |
| POST | `/api/auth/register` | public | `AuthController::register` |
| POST | `/api/auth/logout` | public | `AuthController::logout` |
| GET | `/api/tenants` | public | `TenantController::index` |
| GET | `/api/donate/:slug/campaigns` | tenant | `CampaignController::publicIndex` — **open only** |
| POST | `/api/donate/:slug/campaigns/:id/donations` | tenant | `DonationController::store` |
| GET | `/api/donate/:slug/stream` | tenant | `StreamController::stream` |
| GET | `/api/:slug/campaigns` | admin | `CampaignController::index` — all statuses |
| POST | `/api/:slug/campaigns` | admin | `CampaignController::store` |
| POST | `/api/:slug/campaigns/:id/close` | admin | `CampaignController::close` |
| GET | `/api/:slug/stream` | admin | `StreamController::stream` |

### Error codes
- `400` → `\InvalidArgumentException` (VO validation, deadline in past)
- `401` → unauthenticated
- `403` → slug mismatch (token tenant ≠ URL slug)
- `404` → tenant or campaign not found
- `422` → `\DomainException` (duplicate name, domain rule violation)

### Auth flow
1. POST `/api/auth/login` → server sets `auth_token` **HttpOnly cookie** (expires 24h) → returns `{ slug, churchName, userEmail }`
2. Frontend stores session metadata in `localStorage` (not the token — JS never touches it)
3. Admin API requests send the cookie automatically (same-origin)
4. `AuthMiddleware` validates cookie → extracts `tenantId` → checks URL slug matches token slug

---

## Database Schema

```sql
tenants(id CHAR(36) PK, slug VARCHAR(50) UNIQUE, name VARCHAR(100), created_at)

campaigns(id CHAR(36) PK, tenant_id CHAR(36) FK, name VARCHAR(100),
          goal_cents INT UNSIGNED, currency CHAR(3),
          status ENUM('open','closed') DEFAULT 'open',
          deadline DATE, created_at DATETIME)
  INDEXES: PRIMARY(id), idx_campaigns_tenant_id(tenant_id),
           idx_campaigns_tenant_status(tenant_id, status)

donations(id CHAR(36) PK, campaign_id CHAR(36) FK, donor_name VARCHAR(80),
          amount_cents INT UNSIGNED, recorded_at DATETIME)
  INDEXES: PRIMARY(id), idx_donations_campaign_id(campaign_id)

users(id CHAR(36) PK, tenant_id CHAR(36) FK, email VARCHAR(255) UNIQUE,
      password_hash VARCHAR(255), role VARCHAR(50), created_at DATETIME)

auth_tokens(id CHAR(36) PK, user_id CHAR(36) FK, token VARCHAR(255) UNIQUE,
            expires_at DATETIME, created_at DATETIME)
```

---

## Frontend

### Tailwind Palette
```ts
primary: colors.amber    // buttons, accents, header bg, card headers
success: colors.emerald  // open badge, raised amount, success banners
neutral: colors.slate    // text, borders, backgrounds
```

### Component Conventions (skill: `.claude/skills/frontend.md`)
- Block order: `<script setup>` → `<template>` → `<style scoped>` (rare)
- All strings backticks, all functions arrow functions, all `if` bodies braced
- Props: export interface + destructure with inline defaults
- Collections: Lodash `_.chain()` / `_.orderBy()` / `_.sumBy()` — never native array methods
- CVA: bind directly in template, never in `computed()`
- i18n: `const { t: $t } = useI18n()` — zero hardcoded English strings in templates

### Auto-imports (do NOT import in .vue files)
`ref`, `computed`, `watch`, `reactive`, `useI18n`, `cva`, `storeToRefs`, `navigateTo`,
`useRoute`, `definePageMeta`, `onMounted`, `onUnmounted` — all Nuxt/Vue auto-imports.
All `composables/`, `utils/`, and `stores/` are also auto-imported.

**DO import manually:** `storeToRefs` from `'pinia'`, `useRouter` from `'vue-router'`, types with `import type`.

### Stores
| Store | What it holds | Key methods |
|-------|-------------|-------------|
| `useAuthStore` | `slug`, `churchName`, `userEmail`, `isAuthenticated` | `login`, `register`, `logout`, `clearSession`, `restore`, `persist` |
| `useCampaignsStore` | `campaigns[]`, `loading`, `error` | `fetchCampaigns` (public), `fetchAdminCampaigns` (admin), `recordDonation`, `createCampaign`, `closeCampaign` |
| `useTenantsStore` | `tenants[]`, `loading`, `error` | `fetchTenants` |

All stores (except auth login/register/logout) use `useApi()` so 401 responses auto-clear the session and redirect to `/admin`.

### Composables
| File | Purpose |
|------|---------|
| `useApi.ts` | `$fetch.create` wrapper — intercepts 401 → `clearSession()` + `navigateTo('/admin')` |
| `useCurrency.ts` | `formatCents(cents, currency)` via `Intl.NumberFormat` |
| `useSse.ts` | Opens `EventSource`, parses `{type, data}` messages, calls `onEvent` callback, fires `onConnect` on (re)connect, cleans up on unmount |

### Utils
| File | Purpose |
|------|---------|
| `utils/apiError.ts` | Extracts `e.data.error` from ofetch errors — shows server message instead of HTTP status |

### Middleware
`middleware/auth.ts` — client-only, calls `auth.restore()` then redirects to `/admin` if not authenticated. Applied via `definePageMeta({ middleware: 'auth' })` on admin pages.

### Pages

| Route | File | Auth | Notes |
|-------|------|------|-------|
| `/` | `pages/index.vue` | public | Tenant selector; fixed admin footer link |
| `/donate/:slug` | `pages/donate/[slug]/index.vue` | public | Open campaigns only (backend filtered) |
| `/donate/:slug/:campaignId` | `pages/donate/[slug]/[campaignId].vue` | public | Donation form + confirm modal; closed campaign shows warning banner |
| `/admin` | `pages/admin/index.vue` | public | Login; redirects to `/:slug/dashboard` on success |
| `/admin/register` | `pages/admin/register.vue` | public | Register; tenant slug is a dropdown from `/api/tenants` |
| `/:slug/dashboard` | `pages/[slug]/dashboard.vue` | ✓ | CampaignTable + SSE real-time; click row → donors page |
| `/:slug/campaigns/new` | `pages/[slug]/campaigns/new.vue` | ✓ | CampaignForm → ConfirmOpenModal → success state |
| `/:slug/campaigns/:id/donors` | `pages/[slug]/campaigns/[id]/donors.vue` | ✓ | DonorTable for a specific campaign |

### Real-time (SSE)
Only the admin dashboard uses SSE (public pages use static fetch on mount).

`useSse(() => '/api/:slug/stream', (type, data) => ..., { onConnect: () => refetch })`

- `DonationRecorded` → updates `campaign.raisedCents` and `campaign.donations` **in-place** (no network request)
- `CampaignCreated` / `CampaignClosed` → full `fetchAdminCampaigns()` refetch
- `onConnect` fires on every (re)connect to resync any missed events

### Components

**`common/`** — domain-agnostic atoms and shells

| Component | CVA | Description |
|-----------|-----|-------------|
| `BaseButton` | ✓ variant × size | primary/secondary/danger/ghost · sm/md/lg · loading spinner |
| `BaseInput` | ✓ state | label, error message, v-model, min/max props |
| `BaseTextarea` | ✓ state | same as BaseInput, resize-none |
| `BaseSelect` | ✓ state | options via `SelectOption[]` prop |
| `BaseBadge` | ✓ variant | open (emerald) / closed (slate) / neutral |
| `BaseModal` | — | Teleport to body, Transition via Tailwind classes, backdrop click closes, slots: header/body/footer |
| `BaseTable` | — | Loading/empty/filled shell; both CampaignTable and DonorTable use it |
| `ProgressBar` | — | amber bar, `raisedCents/goalCents` props |
| `AlertBanner` | ✓ variant | success/error/warning inline banner |
| `AuthCard` | — | centered card shell for login/register pages |
| `AppHeader` | — | amber bg, shows church name + Dashboard + Logout when authenticated |

**`campaign/`** — domain-aware components

| Component | Description |
|-----------|-------------|
| `CampaignCard` | card with badge + progress bar; `adminMode` shows Close button |
| `CampaignForm` | create campaign; validates deadline ≥ tomorrow client-side |
| `DonationForm` | donor name + amount; emits `RecordDonationPayload` |
| `ConfirmDonationModal` | shows donation summary before POST |
| `ConfirmOpenModal` | shows campaign preview before create; `loading` prop disables confirm |
| `ConfirmCloseModal` | shows warning if goal not reached before close |
| `CampaignTable/` | index + Header + Body + Footer; row click → donors page; `.stop` on Close button |
| `DonorTable/` | index + Header + Body + Footer; sorted by date desc; footer shows total |

**`tenant/`**

| Component | Description |
|-----------|-------------|
| `TenantCard` | amber header strip with church name + "View Campaigns" button |

---

## Multi-Tenancy

- Shared DB, scoped queries — every table has `tenant_id`
- Public routes: `TenantResolver` looks up slug → `tenant_id` → 404 if unknown
- Admin routes: `AuthMiddleware` extracts `tenant_id` from token — no URL lookup
- URL slug on admin routes is **cosmetic only** — mismatch with token slug → 403
- Auto-close runs per-tenant on every `CampaignFinder` call

---

## Skills

- `.claude/skills/backend.md` — DDD/hexagonal PHP patterns
- `.claude/skills/frontend.md` — Vue 3 + TypeScript standards (CVA, Lodash, i18n rules)
- `.claude/skills/devops.md` — Docker multi-stage, nginx config, deploy steps

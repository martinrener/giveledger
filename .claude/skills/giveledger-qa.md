# GiveLedger QA — Skill Reference

> Framework Playwright + TypeScript para testear GiveLedger. Misma arquitectura que ParaBank (BasePage Proxy, BaseAPI, fixtures, helpers por dominio) adaptada al dominio de GiveLedger: tenants, campaigns y donations.

---

## Contexto del Proyecto

**App:** GiveLedger — multi-tenant giving campaign tracker para iglesias  
**Backend:** PHP Hexagonal Architecture, PDO, MySQL, Redis  
**Frontend:** Nuxt 3 + Vue 3 + TypeScript  
**Auth:** Token-based (Bearer), almacenado en Pinia (no localStorage)  
**Multi-tenancy:** tenant resuelto por header `X-Tenant-ID` o subdominio  
**Repo de QA:** repo separado — `martinrener/giveledger-playwright`

---

## 1. Estructura del Proyecto

```
fixtures/
├── index.ts            → Fixture exports + test.extend registration
├── BasePage.ts         → Page + API context autenticado via Proxy pattern
└── BaseAPI.ts          → API-only context para tests sin browser

functions/
├── common.ts           → generateCampaignData, generateDonationData, unique ID factories
├── campaigns.ts        → createCampaign, closeCampaign, getCampaign
├── donations.ts        → createDonation
└── auth.ts             → getAdminToken, getTenantHeaders

page-objects/
├── CampaignListPage.ts
├── CampaignDetailPage.ts
├── DonationFormPage.ts
└── CampaignFormPage.ts

reporter/
└── reporter.ts         → Custom reporter: flaky tracking + run history

tests/
├── setup/
│   └── auth.setup.ts   → Guarda auth state global
├── api/
│   ├── campaigns.api.test.ts
│   ├── donations.api.test.ts
│   └── tenant-isolation.api.test.ts
└── ui/
    ├── campaigns.spec.ts
    ├── donations.spec.ts
    └── close-campaign.spec.ts

playwright.config.ts
.env.example
tsconfig.json
eslint.config.js
```

---

## 2. Variables de Entorno — `.env.example`

```
BASE_URL=http://localhost:80
API_BASE_URL=http://localhost:80/api

# Tenant A — Grace Church
TENANT_A_ID=11111111-1111-4111-a111-111111111111
TENANT_A_SLUG=grace-church
TENANT_A_ADMIN_EMAIL=admin@grace.com
TENANT_A_ADMIN_PASSWORD=secret123

# Tenant B — Hope Chapel (para tests de aislamiento)
TENANT_B_ID=22222222-2222-4222-a222-222222222222
TENANT_B_SLUG=hope-chapel
TENANT_B_ADMIN_EMAIL=admin@hope.com
TENANT_B_ADMIN_PASSWORD=secret123
```

> Cero credenciales hardcodeadas en tests. Todo via `process.env`.

---

## 3. Annotation IDs — Convención

Formato: `DOMAIN-NNN`

| Prefijo | Dominio |
|---------|---------|
| `CAMP-` | Campaigns |
| `DON-`  | Donations |
| `TENT-` | Tenant isolation |
| `AUTH-` | Authentication |
| `UI-`   | UI-only flows |

Ejemplos: `CAMP-001`, `DON-003`, `TENT-001`

---

## 4. Fixtures

### `BasePage.ts` — Proxy Pattern

Wrappea `Page` via Proxy. Agrega un API context autenticado con el token del tenant activo.

```ts
import type { Page, APIRequestContext } from '@playwright/test'
import { request } from '@playwright/test'

export class BasePage {
    public page: Page
    private api: APIRequestContext | null = null

    constructor(page: Page) {
        this.page = page
        return new Proxy(this, {
            get(target, prop) {
                return prop in target ? target[prop as keyof BasePage] : (target.page as any)[prop]
            }
        })
    }

    async getAPI(): Promise<APIRequestContext> {
        if (!this.api) {
            this.api = await request.newContext({
                baseURL: process.env.API_BASE_URL,
                extraHTTPHeaders: {
                    'X-Tenant-ID': process.env.TENANT_A_ID!,
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.ADMIN_TOKEN}`
                }
            })
        }
        return this.api
    }

    async dispose(): Promise<void> {
        await this.api?.dispose()
    }
}
```

### `BaseAPI.ts` — API-only context

Para tests de API sin browser. Acepta un `tenantId` explícito para poder testear aislamiento entre tenants.

```ts
import { request } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

export class BaseAPI {
    private apiContext!: APIRequestContext

    async init(tenantId: string, token: string): Promise<void> {
        this.apiContext = await request.newContext({
            baseURL: process.env.API_BASE_URL,
            extraHTTPHeaders: {
                'X-Tenant-ID': tenantId,
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
    }

    get(url: string, opts?: Parameters<APIRequestContext['get']>[1]) {
        return this.apiContext.get(url, opts)
    }
    post(url: string, opts?: Parameters<APIRequestContext['post']>[1]) {
        return this.apiContext.post(url, opts)
    }
    patch(url: string, opts?: Parameters<APIRequestContext['patch']>[1]) {
        return this.apiContext.patch(url, opts)
    }
    delete(url: string, opts?: Parameters<APIRequestContext['delete']>[1]) {
        return this.apiContext.delete(url, opts)
    }

    async dispose(): Promise<void> {
        await this.apiContext.dispose()
    }
}
```

### `fixtures/index.ts`

```ts
import { test as base } from '@playwright/test'
import type { Page } from '@playwright/test'
import { BasePage } from './BasePage'
import { BaseAPI } from './BaseAPI'

export type CustomPage = BasePage & Page

interface MyFixtures {
    customPage: CustomPage
    apiContext: BaseAPI
    tenantBContext: BaseAPI   // para tests de aislamiento
}

export const test = base.extend<MyFixtures>({
    customPage: async ({ page }, use) => {
        const bp = new BasePage(page)
        await use(bp as CustomPage)
        await bp.dispose()
    },

    apiContext: async ({}, use) => {
        const api = new BaseAPI()
        await api.init(process.env.TENANT_A_ID!, process.env.ADMIN_TOKEN!)
        await use(api)
        await api.dispose()
    },

    tenantBContext: async ({}, use) => {
        const api = new BaseAPI()
        await api.init(process.env.TENANT_B_ID!, process.env.TENANT_B_TOKEN!)
        await use(api)
        await api.dispose()
    }
})

export { expect } from '@playwright/test'
```

---

## 5. Helper Functions

### `functions/common.ts`

```ts
import { faker } from '@faker-js/faker'

export const generateCampaignData = () => ({
    name: `Campaign-${faker.string.alphanumeric(8)}`,
    goal_cents: faker.number.int({ min: 10000, max: 1000000 }),
    currency: 'USD',
    deadline: faker.date.future({ years: 1 }).toISOString().split('T')[0]
})

export const generateDonationData = (amountCents?: number) => ({
    donor_name: faker.person.fullName(),
    amount_cents: amountCents ?? faker.number.int({ min: 100, max: 50000 }),
    currency: 'USD'
})
```

### `functions/campaigns.ts`

```ts
import type { BaseAPI } from '@/fixtures/BaseAPI'

export const createCampaign = async (api: BaseAPI, data?: object): Promise<string> => {
    const { generateCampaignData } = await import('./common')
    const payload = data ?? generateCampaignData()
    const res = await api.post('/campaigns', { data: payload })
    const body = await res.json()
    return body.id
}

export const getCampaign = async (api: BaseAPI, campaignId: string): Promise<Record<string, unknown>> => {
    const res = await api.get(`/campaigns/${campaignId}`)
    return res.json()
}

export const closeCampaign = async (api: BaseAPI, campaignId: string): Promise<void> => {
    await api.patch(`/campaigns/${campaignId}/close`)
}
```

### `functions/donations.ts`

```ts
import type { BaseAPI } from '@/fixtures/BaseAPI'

export const createDonation = async (
    api: BaseAPI,
    campaignId: string,
    data?: object
): Promise<string> => {
    const { generateDonationData } = await import('./common')
    const payload = data ?? generateDonationData()
    const res = await api.post(`/campaigns/${campaignId}/donations`, { data: payload })
    const body = await res.json()
    return body.id
}
```

---

## 6. Test Design — Casos Críticos a Cubrir

### API Tests (`tests/api/`)

**campaigns.api.test.ts**
| ID | Caso |
|----|------|
| CAMP-001 | Crear campaign con datos válidos → 201 |
| CAMP-002 | Crear campaign con nombre < 3 chars → 422 |
| CAMP-003 | Crear campaign con goal = 0 → 422 |
| CAMP-004 | Crear campaign con deadline en el pasado → 422 |
| CAMP-005 | Listar campaigns del tenant → solo devuelve las propias |
| CAMP-006 | Cerrar campaign con goal alcanzado → 200 |
| CAMP-007 | Cerrar campaign sin alcanzar el goal → 422 |
| CAMP-008 | Cerrar campaign ya cerrada → 422 |

**donations.api.test.ts**
| ID | Caso |
|----|------|
| DON-001 | Donar a campaign abierta → 201 |
| DON-002 | Donar a campaign cerrada → 422 |
| DON-003 | Donar amount = 0 → 422 |
| DON-004 | Donar amount negativo → 422 |
| DON-005 | Donar sin donor_name → 422 |

**tenant-isolation.api.test.ts**
| ID | Caso |
|----|------|
| TENT-001 | Tenant B no puede ver campaigns de Tenant A |
| TENT-002 | Tenant B no puede donar en campaign de Tenant A |
| TENT-003 | Tenant B no puede cerrar campaign de Tenant A |
| TENT-004 | Request sin X-Tenant-ID header → 404 |

### UI Tests (`tests/ui/`)

| ID | Caso |
|----|------|
| UI-001 | Campaign list muestra campaigns del tenant |
| UI-002 | Crear campaign desde el form → aparece en la lista |
| UI-003 | Detail page muestra progreso hacia el goal |
| UI-004 | Donation form registra donación → progreso se actualiza |
| UI-005 | Campaign cerrada muestra badge "Closed" y oculta donation form |

---

## 7. Estructura de Cada Test — AAA

```ts
test('Campaigns > Donations > Reject donation on closed campaign',
{ annotation: { type: 'ID', description: 'DON-002' } },
async ({ apiContext }) => {
    // Arrange
    const campaignId = await createCampaign(apiContext, {
        ...generateCampaignData(),
        goal_cents: 1000
    })
    await createDonation(apiContext, campaignId, { amount_cents: 1000, donor_name: 'Test Donor', currency: 'USD' })
    await closeCampaign(apiContext, campaignId)

    // Act
    const res = await apiContext.post(`/campaigns/${campaignId}/donations`, {
        data: generateDonationData()
    })

    // Assert
    expect(res.status()).toBe(422)
    const body = await res.json()
    expect(body.error).toContain('closed')

    // No cleanup needed — campaign ya está cerrada, no genera datos colgados
})
```

---

## 8. `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: [
        ['./reporter/reporter.ts'],
        ['html'],
        ['list']
    ],
    use: {
        baseURL: process.env.BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },
    projects: [
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/
        },
        {
            name: 'api',
            testMatch: /.*\.api\.test\.ts/
        },
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            dependencies: ['setup'],
            testMatch: /.*\.spec\.ts/
        }
    ]
})
```

---

## 9. Reglas No Negociables

- AAA structure con comentarios en **cada test** — sin excepciones
- Annotation ID único en **cada test** — formato `CAMP-001`, `DON-002`, etc.
- Cada test crea sus propios datos — nunca depende de datos de otro test
- Cleanup en `afterEach` o al final del test — siempre corre aunque fallen las assertions
- Cero `waitForTimeout` — usar `waitForResponse` o `expect(locator).toBeVisible()`
- Selectores por prioridad: `getByRole` → `getByTestId` → `getByLabel` — nunca nth-child ni XPath
- Todo selector encapsulado en Page Objects — nunca en el test directamente
- Tests de tenant isolation siempre usan `tenantBContext` como fixture separado — nunca reusar `apiContext`
- ESLint clean antes de commitear — zero warnings

---

## 10. Consideraciones Específicas de GiveLedger

**Multi-tenancy en tests:** el header `X-Tenant-ID` va en el `BaseAPI.init()` — nunca hardcodeado en un test individual.

**Amounts en cents:** todos los `amount_cents` y `goal_cents` son enteros. `$10.00 = 1000`. Los helpers de `common.ts` ya manejan esto.

**Deadline:** siempre una fecha futura en formato `YYYY-MM-DD`. `generateCampaignData()` ya la genera correctamente con faker.

**Close campaign:** para poder cerrar una campaign en un test, primero hay que acumular donations hasta alcanzar el `goal_cents`. El helper `createDonation` acepta `amount_cents` explícito para facilitar esto.

**Tenant isolation tests:** son los más críticos del proyecto — representan un hard error de seguridad si fallan. Siempre corren primero y con datos frescos.

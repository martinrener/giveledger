# GiveLedger QA — Skill Reference

Playwright + TypeScript test suite that lives inside the main repo at `test/`. Tests run against a live server (local Docker or GCP).

---

## 1. Estructura del Proyecto

```
test/
├── .env                    → BASE_URL, API_BASE_URL, tenant credentials
├── playwright.config.ts    → projects: setup → api + chromium
├── fixtures/
│   ├── index.ts            → test.extend() — exports { test, expect }
│   ├── BasePage.ts         → Proxy wrapping Page; adds goto/waitForURL helpers
│   └── BaseAPI.ts          → APIRequestContext con cookie auth
├── api-objects/            → domain-scoped API wrappers (retornan parsed JSON)
│   ├── AuthApi.ts
│   ├── CampaignApi.ts
│   ├── DonationApi.ts
│   ├── PublicCampaignApi.ts
│   └── TenantApi.ts
├── helpers/                → funciones de setup que crean datos y retornan IDs
│   ├── auth.ts             → loginAsTenantA, loginAsTenantB
│   ├── campaigns.ts        → createCampaign, closeCampaign
│   ├── donations.ts        → createDonation, donateToNewCampaign
│   └── tenants.ts          → getTenantSlugs
├── functions/
│   └── common.ts           → tenantA(), tenantB(), uniqueName(), validGoal(),
│                             futureDeadline(), anyEmail(), anyPassword(),
│                             incorrectPassword()
├── page-objects/           → un archivo por página, extienden BasePage
│   ├── LandingPage.ts
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── DashboardPage.ts
│   ├── DonateListPage.ts
│   ├── DonationFormPage.ts
│   ├── NewCampaignPage.ts
│   └── DonorListPage.ts
└── tests/
    ├── setup/
    │   └── auth.setup.ts   → registra + autentica tenants A y B; guarda storageState
    ├── api/
    │   ├── auth.api.test.ts
    │   ├── campaigns.api.test.ts
    │   ├── donations.api.test.ts
    │   ├── public-campaigns.api.test.ts
    │   └── tenants.api.test.ts
    └── ui/
        ├── landing.spec.ts
        ├── login.spec.ts
        ├── register.spec.ts
        ├── dashboard.spec.ts
        ├── donate-list.spec.ts
        ├── donation-form.spec.ts
        ├── new-campaign.spec.ts
        └── donors.spec.ts
```

---

## 2. Variables de Entorno

```
BASE_URL=http://<host>
API_BASE_URL=http://<host>/api

TENANT_A_SLUG=grace-church
TENANT_A_NAME=Grace Church
TENANT_A_ADMIN_EMAIL=admin@grace-church.com
TENANT_A_ADMIN_PASSWORD=secret123

TENANT_B_SLUG=hope-chapel
TENANT_B_NAME=Hope Chapel
TENANT_B_ADMIN_EMAIL=admin@hope-chapel.com
TENANT_B_ADMIN_PASSWORD=secret123
```

Cero credenciales hardcodeadas en tests — todo via `process.env` y helpers de `functions/common.ts`.

---

## 3. Auth — Cookie-based, no Bearer

El backend emite una cookie HttpOnly `auth_token` en el login. **No hay Bearer token.**

- `APIRequestContext` envía la cookie automáticamente en mismo origen.
- `storageState` de Playwright serializa las cookies entre setup → tests.
- Los tests de API usan `BaseAPI` que recibe el `storageState` del tenant correspondiente.

```ts
// Así autentica BaseAPI — usa las cookies del storageState guardado
this.apiContext = await request.newContext({
    baseURL: process.env.API_BASE_URL,
    storageState: storageStatePath,   // contiene la cookie auth_token
})
```

Los tests de aislamiento (Tenant B) usan un `storageState` separado del Tenant B.

---

## 4. Fixtures — `fixtures/index.ts`

```ts
export const test = base.extend<{
    authApiA: BaseAPI
    authApiB: BaseAPI
    page: BasePage & Page
}>({
    authApiA: async ({}, use) => {
        const api = new BaseAPI()
        await api.init(STORAGE_A)
        await use(api)
        await api.dispose()
    },
    authApiB: async ({}, use) => {
        const api = new BaseAPI()
        await api.init(STORAGE_B)
        await use(api)
        await api.dispose()
    },
    page: async ({ browser }, use) => {
        const ctx  = await browser.newContext({ storageState: STORAGE_A })
        const page = await ctx.newPage()
        await use(new Proxy(new BasePage(page), ...) as BasePage & Page)
        await ctx.close()
    },
})
```

---

## 5. API Objects

Wrappers por dominio. Retornan `Promise<Response>` (no JSON parsed) para que el test pueda assertar el status.

```ts
// api-objects/CampaignApi.ts — ejemplo
export class CampaignApi {
    constructor(private api: BaseAPI) {}

    create(slug: string, payload: object) {
        return this.api.post(`/${slug}/campaigns`, { data: payload })
    }
    list(slug: string) {
        return this.api.get(`/${slug}/campaigns`)
    }
    close(slug: string, id: string) {
        return this.api.post(`/${slug}/campaigns/${id}/close`)
    }
}
```

---

## 6. Helpers

Crean datos y retornan identificadores. Nunca assertan — son setup, no test.

```ts
// helpers/campaigns.ts
export const createCampaign = async (
    api: BaseAPI,
    slug: string,
    overrides: Partial<CampaignPayload> = {}
): Promise<string> => {
    const res  = await new CampaignApi(api).create(slug, { ...defaults(), ...overrides })
    const body = await res.json()
    return body.id  // retorna el ID para usar en el test
}
```

Nunca usar helpers para assertar resultados de API — eso va en los tests.

---

## 7. Page Objects

Todos extienden `BasePage`. Métodos de acción (`async`) + locators (síncronos, retornan `Locator`).

```ts
export class DashboardPage extends BasePage {
    async visit(slug: string) {
        await this.goto(`/${slug}/dashboard`)
        await this.getByRole('heading', { name: 'Campaigns', level: 1 }).waitFor()
    }

    campaignRow(name: string) {
        return this.getByRole('row').filter({ hasText: name })
    }

    async campaignNames() {
        return this.getByTestId('campaign-name-cell').allTextContents()
    }

    async getCampaignStatus(name: string) {
        return this.campaignRow(name).getByTestId('campaign-status-cell').textContent()
    }
}
```

---

## 8. Selectores — Reglas de Prioridad

### Prioridad 1 — `getByRole` (siempre que el elemento tenga rol semántico)

| Elemento | Selector |
|----------|----------|
| Botón | `getByRole('button', { name: '...' })` |
| Link | `getByRole('link', { name: '...' })` |
| Heading | `getByRole('heading', { name: '...', level: N })` |
| Input | `getByLabel('...')` |
| Fila de tabla | `getByRole('row').filter({ hasText: '...' })` |
| Celda de tabla | `getByRole('cell')` (dentro de una row) |

### Prioridad 2 — `getByTestId` (contenedores sin rol semántico)

Solo cuando no existe rol semántico. Agregar `data-testid` al componente Vue y usar `getByTestId('...')`.

**Inventario de `data-testid` en GiveLedger:**

| Componente Vue | `data-testid` | Uso |
|----------------|--------------|-----|
| `TenantCard.vue` root div | `tenant-card` | `getByTestId('tenant-card').filter({ has: getByRole('heading', { name, level: 3 }) })` |
| `CampaignCard.vue` root div | `campaign-card` | `getByTestId('campaign-card').filter({ has: getByRole('heading', { name, level: 3 }) })` |
| `BaseInput.vue` error `<p>` | `field-error` | `getByTestId('field-error')` |
| `BaseSelect.vue` error `<p>` | `field-error` | ídem |
| `BaseTextarea.vue` error `<p>` | `field-error` | ídem |
| `CampaignTableBody.vue` td nombre | `campaign-name-cell` | `getByTestId('campaign-name-cell').allTextContents()` |
| `CampaignTableBody.vue` td status | `campaign-status-cell` | `campaignRow(name).getByTestId('campaign-status-cell')` |
| `DonorTableBody.vue` td nombre | `donor-name-cell` | `getByTestId('donor-name-cell').allTextContents()` |
| `donate/[slug]/index.vue` empty state | `campaign-list-empty` | `.or(getByTestId('campaign-list-empty')).first()` |

**Nunca:**
- Selectores CSS de clase (`.overflow-hidden`, `.text-red-600`, etc.)
- `nth-child` o XPath
- Tags sin contexto (`locator('h3')` → usar `getByRole('heading', { level: 3 })`)

---

## 9. Convención de IDs de Test

Formato `PREFIX-NNN`. Cada test lleva `{ annotation: { type: 'id', description: 'PREFIX-NNN' } }`.

| Prefijo | Dominio |
|---------|---------|
| `AUTH-` | Auth API |
| `CAMP-` | Campaigns API (admin) |
| `DON-` | Donations API |
| `PUB-` | Public Campaigns API |
| `TEN-` | Tenants API |
| `LAND-` | Landing page UI |
| `LOGIN-` | Login page UI |
| `REG-` | Register page UI |
| `DASH-` | Dashboard page UI |
| `DL-` | Donate List page UI |
| `DF-` | Donation Form page UI |
| `NEW-` | New Campaign page UI |
| `DONOR-` | Donor List page UI |

---

## 10. Estructura de Cada Test — AAA

```ts
test('DASH-003 > Dashboard > closing a campaign updates its status to Closed',
{ annotation: { type: 'id', description: 'DASH-003' } },
async ({ page, authApiA }) => {
    // Arrange
    const { slug } = tenantA()
    const id = await createCampaign(authApiA, slug, { name: uniqueName() })
    const dash = new DashboardPage(page)
    await dash.visit(slug)

    // Act
    await dash.closeCampaign(name)

    // Assert
    expect(await dash.getCampaignStatus(name)).toContain('Closed')
})
```

Reglas:
- Comentarios `// Arrange`, `// Act`, `// Assert` en **cada test**
- Annotation ID único en **cada test**
- Cada test crea sus propios datos — nunca depende de datos de otro test
- Cero `waitForTimeout` — usar `waitFor()` o `expect(locator).toBeVisible()`
- Todo selector encapsulado en Page Objects — nunca en el test directamente

---

## 11. `playwright.config.ts` — Estructura de Proyectos

```ts
projects: [
    { name: 'setup',    testMatch: /.*\.setup\.ts/  },
    { name: 'api',      testMatch: /.*\.api\.test\.ts/, dependencies: ['setup'] },
    { name: 'chromium', testMatch: /.*\.spec\.ts/,   dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] } },
]
```

- `setup`: registra y autentica Tenant A y B, guarda `storageState` en `.auth/`
- `api`: tests de API pura, usa `storageState` de setup, sin browser
- `chromium`: tests UI, usa `storageState` de setup

Correr desde `test/`: `npx playwright test --reporter=list`

---

## 12. Deploy — Cómo Llegar los Cambios al Servidor

El frontend es una **SPA** (`ssr: false` en `nuxt.config.ts`). El bundle compilado vive en `frontend/.output` y está **trackeado en git** — es la unidad de deploy.

Flujo completo al cambiar componentes Vue:

```bash
# 1. Rebuild desde la raíz del repo
cd frontend && npm run build
# genera frontend/.output con los cambios

# 2. Commit incluyendo el .output reconstruido
git add frontend/.output frontend/components/ frontend/pages/
git commit -m "..."
git push origin main

# 3. Deploy a GCP (vía SSH con clave google_compute_engine)
ssh -i ~/.ssh/google_compute_engine martin_rener@<GCP_IP> \
  "cd ~/giveledger && git pull origin main && \
   docker-compose -f docker-compose.prod.yml up -d --build vue"
```

**Puntos críticos del deploy:**

- `frontend/.output` en **`.gitignore` — NO**. Debe estar trackeado (es el build artefact para el Dockerfile).
- `frontend/.output` en **`.dockerignore` — NO**. El Dockerfile lo copia: `COPY frontend/.output ./.output`.
- `docker-compose.prod.yml` — **no usar `target:`** en el Vue service; el Dockerfile es single-stage.
- El GCP server usa `docker-compose` (con guión, no `docker compose` plugin).
- El SSH user en GCP es `martin_rener` (con guión bajo).

---

## 13. Reglas No Negociables

1. Selectores: `getByRole` → `getByTestId` — nunca clases CSS
2. Al agregar un `data-testid` a un componente Vue: rebuild el frontend antes de correr tests
3. Tests de aislamiento de tenant siempre usan fixture separado (`authApiB`) — nunca reusar `authApiA`
4. Helpers crean datos; no assertan. Los asserts van solo en los tests.
5. ESLint limpio antes de commitear
6. Cada test es autónomo — crea sus propios datos, no depende de orden de ejecución

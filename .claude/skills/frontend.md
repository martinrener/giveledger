# Frontend Skill — Vue 3 + TypeScript (Tithely Standards)

Reference for all frontend patterns in GiveLedger. These rules are enforced by ESLint — violations block the PR.

---

## Non-Negotiable Rules (ESLint enforced)

| Rule | Correct | Wrong |
|------|---------|-------|
| Strings | backticks everywhere | `'single'` or `"double"` |
| Functions | arrow functions only | `function foo() {}` |
| Conditionals | always use `{}` braces | `if (x) doThing()` |
| Props | destructure with inline defaults | `withDefaults()` |
| Collections | Lodash `chain()` / `get()` | `.filter().map()` native |
| Types | explicit — no `any` | `any` → use `unknown` + type guard |
| i18n | `const { t: $t } = useI18n()` | using `t` directly |
| CVA | bind directly in template | wrap in `computed()` |
| Block order | `<script>` → `<template>` → `<style>` | any other order |

---

## Auto-imports — DO NOT import these in .vue files

Already available globally: `ref`, `computed`, `watch`, `reactive`, `useI18n`, `cva`, `toast`, `storeToRefs`

DO import manually: `storeToRefs` from `'pinia'`, `useRouter` from `'vue-router'`, types with `import type`

---

## Component Structure

```vue
<script lang="ts" setup>
// 1. Manual imports only (pinia, vue-router, types)
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import type { Campaign } from '@/types/campaign'

// 2. Props — export the interface
export interface Props {
  campaign: Campaign
  loading?: boolean
  onSave?: (c: Campaign) => void
}

const { campaign, loading = false, onSave = () => {} } = defineProps<Props>()

// 3. Emits
const emit = defineEmits<{ saved: [campaign: Campaign] }>()

// 4. Reactive state
const isSubmitting = ref(false)

// 5. Computed
const progressPercent = computed(() =>
  Math.min(100, Math.round((campaign.raisedCents / campaign.goalCents) * 100))
)

// 6. Methods — arrow functions, early returns
const handleSubmit = async () => {
  if (!campaign) { return }
  isSubmitting.value = true
  // ...
}
</script>

<template>
  <!-- template second -->
</template>

<style scoped>
/* style third — Tailwind only, no custom CSS */
</style>
```

---

## TypeScript Patterns

```ts
// Interfaces for objects
interface Campaign {
  id: string
  tenantId: string
  name: string
  goalCents: number
  raisedCents: number
  currency: string
  status: CampaignStatus
  deadline: string
}

// Type aliases for unions
type CampaignStatus = `open` | `closed`
type Currency = `USD` | `EUR` | `GBP` | `ARS` | `UYU`

// Utility types
type CreateCampaign = Omit<Campaign, `id` | `raisedCents`>
type CampaignSummary = Pick<Campaign, `id` | `name` | `status`>
type PartialCampaign = Partial<Campaign>

// No any — use unknown with type guard
const parse = (raw: unknown): Campaign => {
  if (typeof raw !== `object` || raw === null) {
    throw new Error(`Invalid campaign data`)
  }
  return raw as Campaign
}
```

---

## Lodash Patterns

```ts
import _ from 'lodash'

// chain() for collection pipelines — always end with .value()
const activeCampaigns = _.chain(campaigns)
  .filter(c => c.status === `open`)
  .sortBy(`name`)
  .map(c => ({ id: c.id, name: c.name, progress: c.raisedCents / c.goalCents }))
  .value()

// Donor list — groupBy pattern from spec
const donorLeaderboard = _.chain(donations)
  .groupBy(`donorName`)
  .mapValues(ds => _.sumBy(ds, `amountCents`))
  .toPairs()
  .orderBy([1], [`desc`])
  .value()

// get() for safe deep access
const name = _.get(campaign, `name`, `Unknown Campaign`)
const currency = _.get(config, `defaults.currency`, `USD`)

// Other common helpers
const unique    = _.uniqBy(campaigns, `id`)
const grouped   = _.groupBy(donations, `campaignId`)
const sanitized = _.omit(payload, [`tenantId`])
const summary   = _.pick(campaign, [`id`, `name`, `status`])
```

---

## CVA Pattern

```ts
// Define in script
const statusBadge = cva(`rounded-full px-2 py-1 text-xs font-medium`, {
  variants: {
    status: {
      open:   `bg-green-100 text-green-800`,
      closed: `bg-gray-100 text-gray-600`,
    }
  }
})
```

```html
<!-- Bind directly in template — NEVER in computed() -->
<span :class="statusBadge({ status: campaign.status })">
  {{ $t(`campaign.status.${campaign.status}`) }}
</span>
```

---

## i18n Pattern

```ts
// Always rename t → $t
const { t: $t } = useI18n()

// Usage
const label = $t(`campaign.create`)
const error = $t(`validation.nameRequired`)
const msg   = $t(`campaign.closedAt`, { date: deadline })
```

```json
// frontend/i18n/en.json structure
{
  "campaign": {
    "create": "Create Campaign",
    "status": { "open": "Open", "closed": "Closed" },
    "closedAt": "Closed on {date}"
  },
  "donation": {
    "record": "Make a Donation",
    "amount": "Amount"
  },
  "validation": {
    "nameRequired": "Name is required",
    "nameLength": "Name must be 3–100 characters",
    "amountPositive": "Amount must be greater than 0"
  }
}
```

Zero hardcoded English strings in templates — everything through `$t()`.

---

## Pages — Required Routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `pages/index.vue` | Campaign list — `_.orderBy` + search with `_.filter` |
| `/campaigns/[id]` | `pages/campaigns/[id].vue` | Detail — progress bar + donor leaderboard |
| `/campaigns/[id]/donate` | `pages/campaigns/[id]/donate.vue` | Multi-step donation form |
| `/campaigns/new` | `pages/campaigns/new.vue` | Create campaign form |

---

## Composable Pattern

```ts
// composables/useCampaigns.ts
const useCampaigns = () => {
  const campaigns = ref<Campaign[]>([])
  const loading   = ref(false)
  const error     = ref<string | null>(null)

  const fetchAll = async () => {
    loading.value = true
    try {
      const data = await $fetch<Campaign[]>(`/api/v1/campaigns`)
      campaigns.value = data
    } catch (e) {
      error.value = `Failed to load campaigns`
    } finally {
      loading.value = false
    }
  }

  return { campaigns, loading, error, fetchAll }
}

export default useCampaigns
```

---

## API Integration

```ts
// queries/campaignQueries.ts
const API = `/api/v1`

export const campaignQueries = {
  getAll: () =>
    $fetch<Campaign[]>(`${API}/campaigns`),

  getById: (id: string) =>
    $fetch<Campaign>(`${API}/campaigns/${id}`),

  create: (payload: CreateCampaign) =>
    $fetch(`${API}/campaigns`, { method: `POST`, body: payload }),

  recordDonation: (campaignId: string, payload: RecordDonation) =>
    $fetch(`${API}/campaigns/${campaignId}/donations`, { method: `POST`, body: payload }),

  close: (campaignId: string) =>
    $fetch(`${API}/campaigns/${campaignId}/close`, { method: `POST` }),
}
```

---

## File Naming

| Location | Convention | Example |
|----------|------------|---------|
| `components/` | PascalCase.vue | `CampaignCard.vue` |
| `pages/` | kebab-case.vue or `[param].vue` | `[id].vue` |
| `composables/` | camelCase.ts | `useCampaigns.ts` |
| `queries/` | camelCase.ts | `campaignQueries.ts` |
| `types/` | camelCase.ts | `campaign.ts` |

---

## Campaign List Page — Key Pattern

```vue
<script lang="ts" setup>
import _ from 'lodash'
import type { Campaign } from '@/types/campaign'

const { t: $t } = useI18n()
const { campaigns, loading, fetchAll } = useCampaigns()
const search = ref(``)

const filtered = computed(() =>
  _.chain(campaigns.value)
    .filter(c => c.name.toLowerCase().includes(search.value.toLowerCase()))
    .orderBy([`status`, `name`], [`asc`, `asc`])
    .value()
)

const statusBadge = cva(`...`, { variants: { status: { open: `...`, closed: `...` } } })

onMounted(fetchAll)
</script>

<template>
  <input v-model="search" :placeholder="$t('campaign.search')" />
  <div v-for="c in filtered" :key="c.id">
    <span :class="statusBadge({ status: c.status })">{{ $t(`campaign.status.${c.status}`) }}</span>
  </div>
</template>
```

---

## Golden Rules — Quick Check Before Every Component

1. Block order: `<script setup>` → `<template>` → `<style scoped>`?
2. Is the `Props` interface exported?
3. Are props destructured with inline defaults (no `withDefaults`)?
4. Are all strings backticks?
5. Are all functions arrow functions?
6. Are all `if` bodies wrapped in `{}`?
7. Is Lodash used for every array operation?
8. Is `t` renamed to `$t`?
9. Is CVA bound directly in template (not in `computed`)?
10. Zero `any` types?

<script lang="ts" setup>
import _ from 'lodash'
import type { Donation } from '~/types/campaign'

export interface Props {
  donations: Donation[]
  currency:  string
}

const { donations, currency } = defineProps<Props>()

const { t: $t }       = useI18n()
const { formatCents } = useCurrency()

const sorted = computed(() =>
  _.orderBy(donations, `recordedAt`, `desc`)
)

const total = computed(() => _.sumBy(donations, `amountCents`))

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(`en-US`, { year: `numeric`, month: `short`, day: `numeric`, hour: `2-digit`, minute: `2-digit` })
</script>

<template>
  <div class="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white">
    <div v-if="donations.length === 0" class="py-16 text-center text-sm text-neutral-400">
      {{ $t(`donors.empty`) }}
    </div>

    <table v-else class="w-full text-sm">
      <thead class="border-b border-neutral-200 bg-neutral-50">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {{ $t(`donors.donor`) }}
          </th>
          <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {{ $t(`donors.amount`) }}
          </th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {{ $t(`donors.date`) }}
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-neutral-100">
        <tr
          v-for="d in sorted"
          :key="d.id"
          class="hover:bg-neutral-50 transition-colors"
        >
          <td class="px-4 py-3 font-medium text-neutral-900">{{ d.donorName }}</td>
          <td class="px-4 py-3 text-right font-semibold text-success-600">
            {{ formatCents(d.amountCents, currency) }}
          </td>
          <td class="px-4 py-3 text-neutral-500">{{ formatDate(d.recordedAt) }}</td>
        </tr>
      </tbody>

      <tfoot class="border-t border-neutral-200 bg-neutral-50">
        <tr>
          <td class="px-4 py-3 text-xs font-semibold text-neutral-500">
            {{ $t(`donors.total`) }} · {{ donations.length }}
          </td>
          <td class="px-4 py-3 text-right font-bold text-neutral-900">
            {{ formatCents(total, currency) }}
          </td>
          <td />
        </tr>
      </tfoot>
    </table>
  </div>
</template>

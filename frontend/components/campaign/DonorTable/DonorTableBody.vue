<script lang="ts" setup>
import type { Donation } from '~/types/campaign'

export interface Props {
  donations: Donation[]
  currency:  string
}

const { donations, currency } = defineProps<Props>()

const { formatCents } = useCurrency()

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(`en-US`, {
    year:   `numeric`,
    month:  `short`,
    day:    `numeric`,
    hour:   `2-digit`,
    minute: `2-digit`,
  })
</script>

<template>
  <tbody class="divide-y divide-neutral-100">
    <tr
      v-for="d in donations"
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
</template>

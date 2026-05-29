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

const total = computed(() => _.sumBy(donations, `amountCents`))
</script>

<template>
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
</template>

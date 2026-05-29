<script lang="ts" setup>
import _ from 'lodash'
import type { Campaign } from '~/types/campaign'

export interface Props {
  campaigns: Campaign[]
}

const { campaigns } = defineProps<Props>()

const { t: $t }       = useI18n()
const { formatCents } = useCurrency()

const totalRaisedByCurrency = computed(() =>
  _.chain(campaigns)
    .groupBy(`currency`)
    .mapValues(group => _.sumBy(group, `raisedCents`))
    .toPairs()
    .value()
)
</script>

<template>
  <tfoot class="border-t border-neutral-200 bg-neutral-50">
    <tr>
      <td class="px-4 py-3 text-xs font-semibold text-neutral-500" colspan="2">
        {{ $t(`table.total`) }} · {{ campaigns.length }}
      </td>
      <td colspan="2" class="px-4 py-3">
        <div class="flex flex-col gap-0.5">
          <span
            v-for="[cur, cents] in totalRaisedByCurrency"
            :key="cur"
            class="text-xs font-medium text-neutral-700"
          >
            {{ formatCents(cents, cur) }} {{ cur }}
          </span>
        </div>
      </td>
      <td :colspan="2" />
    </tr>
  </tfoot>
</template>

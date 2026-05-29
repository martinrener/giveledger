<script lang="ts" setup>
import _ from 'lodash'
import type { Donation } from '~/types/campaign'

export interface Props {
  donations: Donation[]
  currency:  string
}

const { donations, currency } = defineProps<Props>()

const { t: $t } = useI18n()

const sorted = computed(() => _.orderBy(donations, `recordedAt`, `desc`))
</script>

<template>
  <BaseTable :empty="donations.length === 0" :empty-text="$t(`donors.empty`)">
    <DonorTableHeader />
    <DonorTableBody :donations="sorted" :currency="currency" />
    <DonorTableFooter :donations="donations" :currency="currency" />
  </BaseTable>
</template>

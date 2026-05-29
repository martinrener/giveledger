<script lang="ts" setup>
import { useRouter } from 'vue-router'
import type { Campaign } from '~/types/campaign'

export interface Props {
  campaigns:  Campaign[]
  loading?:   boolean
  adminMode?: boolean
  slug?:      string
}

const { campaigns, loading = false, adminMode = false, slug = `` } = defineProps<Props>()

const emit   = defineEmits<{ close: [id: string] }>()
const router = useRouter()
const { t: $t } = useI18n()

const handleRowClick = (id: string) => {
  if (!slug) { return }
  router.push(`/${slug}/campaigns/${id}/donors`)
}
</script>

<template>
  <BaseTable
    :loading="loading"
    :empty="campaigns.length === 0"
    :empty-text="$t(`table.empty`)"
  >
    <CampaignTableHeader :admin-mode="adminMode" />
    <CampaignTableBody
      :campaigns="campaigns"
      :admin-mode="adminMode"
      @close="emit(`close`, $event)"
      @row-click="handleRowClick"
    />
    <CampaignTableFooter :campaigns="campaigns" />
  </BaseTable>
</template>

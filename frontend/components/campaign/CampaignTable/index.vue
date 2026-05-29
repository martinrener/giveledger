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
  <div class="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white">
    <div v-if="loading" class="flex items-center justify-center py-16 text-sm text-neutral-400">
      {{ $t(`common.loading`) }}
    </div>

    <div v-else-if="campaigns.length === 0" class="py-16 text-center text-sm text-neutral-400">
      {{ $t(`table.empty`) }}
    </div>

    <table v-else class="w-full text-sm">
      <CampaignTableHeader :admin-mode="adminMode" />
      <CampaignTableBody
        :campaigns="campaigns"
        :admin-mode="adminMode"
        @close="emit(`close`, $event)"
        @row-click="handleRowClick"
      />
      <CampaignTableFooter :campaigns="campaigns" />
    </table>
  </div>
</template>

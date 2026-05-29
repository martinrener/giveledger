<script lang="ts" setup>
import type { Campaign } from '~/types/campaign'

export interface Props {
  campaigns: Campaign[]
  loading?:  boolean
  adminMode?: boolean
}

const { campaigns, loading = false, adminMode = false } = defineProps<Props>()

const emit = defineEmits<{ close: [id: string] }>()

const { t: $t } = useI18n()
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
      />
      <CampaignTableFooter :campaigns="campaigns" />
    </table>
  </div>
</template>

<script lang="ts" setup>
import _ from 'lodash'
import { storeToRefs } from 'pinia'
import type { Campaign } from '~/types/campaign'

definePageMeta({ middleware: `auth` })

const route  = useRoute()
const { t: $t } = useI18n()

const slug  = computed(() => route.params.slug as string)
const store = useCampaignsStore()
const { campaigns, loading, error } = storeToRefs(store)

const campaignToClose  = ref<Campaign | null>(null)
const showCloseModal   = ref(false)

const openCampaigns = computed(() =>
  _.filter(campaigns.value, c => c.status === `open`)
)

const handleCloseRequest = (id: string) => {
  const found = _.find(campaigns.value, c => c.id === id)
  if (!found) { return }
  campaignToClose.value = found
  showCloseModal.value  = true
}

const handleCloseConfirm = async () => {
  if (!campaignToClose.value) { return }
  await store.closeCampaign(slug.value, campaignToClose.value.id)
  showCloseModal.value  = false
  campaignToClose.value = null
  if (!store.error) {
    await store.fetchAdminCampaigns(slug.value)
  }
}

const handleCloseModalDismiss = () => {
  showCloseModal.value  = false
  campaignToClose.value = null
}

onMounted(() => store.fetchAdminCampaigns(slug.value))
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-neutral-900">{{ $t(`campaigns.title`) }}</h1>
      <NuxtLink :to="`/${slug}/campaigns/new`">
        <BaseButton variant="primary" size="sm">{{ $t(`campaign.new`) }}</BaseButton>
      </NuxtLink>
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <CampaignTable
      :campaigns="campaigns"
      :loading="loading"
      :admin-mode="true"
      @close="handleCloseRequest"
    />

    <ConfirmCloseModal
      v-if="campaignToClose"
      :open="showCloseModal"
      :campaign="campaignToClose"
      @confirm="handleCloseConfirm"
      @close="handleCloseModalDismiss"
    />
  </div>
</template>

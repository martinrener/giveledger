<script lang="ts" setup>
import _ from 'lodash'
import { storeToRefs } from 'pinia'
import type { RecordDonationPayload } from '~/types/campaign'

const route  = useRoute()
const { t: $t } = useI18n()

const slug       = computed(() => route.params.slug as string)
const campaignId = computed(() => route.params.campaignId as string)

const store = useCampaignsStore()
const { campaigns, loading, error } = storeToRefs(store)

const campaign = computed(() =>
  _.find(campaigns.value, c => c.id === campaignId.value) ?? null
)

const isClosed = computed(() => campaign.value?.status === `closed`)

const pending   = ref<RecordDonationPayload | null>(null)
const showModal = ref(false)
const succeeded = ref(false)

const handleFormSubmit = (payload: RecordDonationPayload) => {
  pending.value   = payload
  showModal.value = true
}

const handleConfirm = async () => {
  if (!pending.value || !campaign.value) { return }
  await store.recordDonation(slug.value, campaignId.value, pending.value)
  showModal.value = false
  if (!store.error) {
    succeeded.value = true
  }
}

onMounted(() => store.fetchCampaigns(slug.value))

useSse(
  () => `/api/donate/${slug.value}/stream`,
  (_type, data) => {
    const d = data as { campaignId?: string }
    if (d?.campaignId === campaignId.value) {
      store.fetchCampaigns(slug.value)
    }
  },
)
</script>

<template>
  <div class="mx-auto max-w-lg">
    <NuxtLink
      :to="`/donate/${slug}`"
      class="mb-5 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800"
    >
      ← {{ $t(`common.back`) }}
    </NuxtLink>

    <p v-if="loading" class="text-sm text-neutral-400">{{ $t(`common.loading`) }}</p>

    <AlertBanner v-else-if="!campaign" variant="error">
      {{ $t(`errors.not_found`) }}
    </AlertBanner>

    <template v-else>
      <div class="mb-6 flex flex-col gap-2">
        <h1 class="text-2xl font-bold text-neutral-900">{{ campaign.name }}</h1>
        <ProgressBar :raised-cents="campaign.raisedCents" :goal-cents="campaign.goalCents" />
      </div>

      <AlertBanner v-if="isClosed" variant="warning">
        This campaign is no longer accepting donations.
        <NuxtLink :to="`/donate/${slug}`" class="ml-1 font-medium underline">
          ← {{ $t(`common.back`) }}
        </NuxtLink>
      </AlertBanner>

      <AlertBanner v-else-if="succeeded" variant="success" class="text-center">
        <p class="font-semibold">{{ $t(`donation.success`) }}</p>
        <NuxtLink
          :to="`/donate/${slug}`"
          class="mt-3 inline-block text-sm font-medium underline"
        >
          ← {{ $t(`common.back`) }}
        </NuxtLink>
      </AlertBanner>

      <div v-else class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 class="mb-5 text-lg font-semibold text-neutral-900">{{ $t(`donation.title`) }}</h2>
        <DonationForm :currency="campaign.currency" @submit="handleFormSubmit" />
        <AlertBanner v-if="error" variant="error" class="mt-3">{{ error }}</AlertBanner>
      </div>
    </template>

    <ConfirmDonationModal
      v-if="pending && campaign"
      :open="showModal"
      :campaign-name="campaign.name"
      :donor-name="pending.donorName"
      :amount-cents="pending.amountCents"
      :currency="pending.currency"
      @confirm="handleConfirm"
      @close="showModal = false"
    />
  </div>
</template>

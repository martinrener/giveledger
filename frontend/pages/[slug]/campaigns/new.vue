<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import type { Campaign, CreateCampaignPayload } from '~/types/campaign'

definePageMeta({ middleware: `auth` })

const route  = useRoute()
const { t: $t } = useI18n()

const slug  = computed(() => route.params.slug as string)
const store = useCampaignsStore()
const { loading, error } = storeToRefs(store)

const showModal = ref(false)
const succeeded = ref(false)
const pending   = ref<CreateCampaignPayload | null>(null)

const previewCampaign = computed<Campaign | null>(() => {
  if (!pending.value) { return null }
  return {
    id:          ``,
    name:        pending.value.name,
    goalCents:   pending.value.goalCents,
    raisedCents: 0,
    currency:    pending.value.currency,
    status:      `open`,
    deadline:    pending.value.deadline,
    donations:   [],
  }
})

const handleFormSubmit = (payload: CreateCampaignPayload) => {
  pending.value   = payload
  showModal.value = true
}

const handleConfirm = async () => {
  if (!pending.value) { return }
  await store.createCampaign(slug.value, pending.value)
  showModal.value = false
  if (!store.error) {
    succeeded.value = true
    pending.value   = null
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg">
    <NuxtLink
      :to="`/${slug}/dashboard`"
      class="mb-5 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800"
    >
      ← {{ $t(`common.back`) }}
    </NuxtLink>

    <h1 class="mb-6 text-2xl font-bold text-neutral-900">{{ $t(`campaign.create`) }}</h1>

    <AlertBanner v-if="succeeded" variant="success" class="mb-4">
      <p class="font-semibold">{{ $t(`campaign.created`) }}</p>
      <p class="mt-1 text-sm opacity-80">{{ $t(`campaign.created_body`) }}</p>
      <div class="mt-4 flex gap-3">
        <NuxtLink :to="`/${slug}/dashboard`">
          <BaseButton variant="primary" size="sm">
            {{ $t(`campaign.back_to_dashboard`) }}
          </BaseButton>
        </NuxtLink>
        <BaseButton variant="secondary" size="sm" @click="succeeded = false">
          {{ $t(`campaign.create`) }}
        </BaseButton>
      </div>
    </AlertBanner>

    <template v-else>
      <div class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <CampaignForm @submit="handleFormSubmit" />
      </div>
      <AlertBanner v-if="error" variant="error" class="mt-3">{{ error }}</AlertBanner>
    </template>

    <ConfirmOpenModal
      v-if="previewCampaign"
      :open="showModal"
      :campaign="previewCampaign"
      @confirm="handleConfirm"
      @close="showModal = false"
    />
  </div>
</template>

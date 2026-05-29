<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import type { Campaign } from '~/types/campaign'
import type { CreateCampaignPayload } from '~/types/campaign'

definePageMeta({ middleware: `auth` })

const route  = useRoute()
const { t: $t } = useI18n()

const slug  = computed(() => route.params.slug as string)
const store = useCampaignsStore()
const { loading, error } = storeToRefs(store)

const showModal   = ref(false)
const succeeded   = ref(false)
const pending     = ref<CreateCampaignPayload | null>(null)

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

const handleModalClose = () => {
  showModal.value = false
}
</script>

<template>
  <div class="mx-auto max-w-lg">
    <h1 class="mb-6 text-2xl font-bold text-neutral-900">{{ $t(`campaign.create`) }}</h1>

    <div
      v-if="succeeded"
      class="flex flex-col gap-4 rounded-xl border border-success-200 bg-success-50 px-6 py-5"
    >
      <div>
        <p class="font-semibold text-success-800">{{ $t(`campaign.created`) }}</p>
        <p class="mt-1 text-sm text-success-700">{{ $t(`campaign.created_body`) }}</p>
      </div>
      <div class="flex gap-3">
        <NuxtLink :to="`/${slug}/dashboard`">
          <BaseButton variant="primary" size="sm">
            {{ $t(`campaign.back_to_dashboard`) }}
          </BaseButton>
        </NuxtLink>
        <BaseButton
          variant="secondary"
          size="sm"
          @click="succeeded = false"
        >
          {{ $t(`campaign.create`) }}
        </BaseButton>
      </div>
    </div>

    <template v-else>
      <div class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <CampaignForm @submit="handleFormSubmit" />
        <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
      </div>
    </template>

    <ConfirmOpenModal
      v-if="previewCampaign"
      :open="showModal"
      :campaign="previewCampaign"
      @confirm="handleConfirm"
      @close="handleModalClose"
    />
  </div>
</template>

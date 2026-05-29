<script lang="ts" setup>
import _ from 'lodash'
import { storeToRefs } from 'pinia'

definePageMeta({ middleware: `auth` })

const route  = useRoute()
const { t: $t } = useI18n()

const slug       = computed(() => route.params.slug as string)
const campaignId = computed(() => route.params.campaignId as string)

const store = useCampaignsStore()
const { campaigns, loading } = storeToRefs(store)

const campaign = computed(() =>
  _.find(campaigns.value, c => c.id === campaignId.value) ?? null
)

onMounted(() => store.fetchAdminCampaigns(slug.value))
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center gap-3">
      <NuxtLink
        :to="`/${slug}/dashboard`"
        class="text-sm text-neutral-500 hover:text-neutral-800"
      >
        ← {{ $t(`donors.back_to_dashboard`) }}
      </NuxtLink>
    </div>

    <p v-if="loading" class="text-sm text-neutral-400">{{ $t(`common.loading`) }}</p>

    <AlertBanner v-else-if="!campaign" variant="error">
      {{ $t(`errors.not_found`) }}
    </AlertBanner>

    <template v-else>
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">{{ campaign.name }}</h1>
          <p class="mt-1 text-sm text-neutral-500">{{ $t(`donors.title`) }}</p>
        </div>
        <BaseBadge :variant="campaign.status">
          {{ $t(`campaigns.status.${campaign.status}`) }}
        </BaseBadge>
      </div>

      <DonorTable :donations="campaign.donations" :currency="campaign.currency" />
    </template>
  </div>
</template>

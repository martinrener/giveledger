<script lang="ts" setup>
import type { Campaign } from '~/types/campaign'

export interface Props {
  campaign: Campaign
  adminMode?: boolean
}

const { campaign, adminMode = false } = defineProps<Props>()

const emit = defineEmits<{
  donate: [id: string]
  close:  [id: string]
}>()

const { t: $t }       = useI18n()
const { formatCents } = useCurrency()

const isClosed = computed(() => campaign.status === `closed`)

const accentCva = cva(`border-l-4`, {
  variants: {
    status: {
      open:   `border-l-primary-400`,
      closed: `border-l-neutral-300`,
    },
  },
})
</script>

<template>
  <div
    :class="[
      `flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md`,
      accentCva({ status: campaign.status }),
    ]"
  >
    <div class="flex items-start justify-between gap-2">
      <h3 class="text-base font-bold text-neutral-900 leading-snug">{{ campaign.name }}</h3>
      <BaseBadge :variant="campaign.status">
        {{ $t(`campaigns.status.${campaign.status}`) }}
      </BaseBadge>
    </div>

    <ProgressBar :raised-cents="campaign.raisedCents" :goal-cents="campaign.goalCents" />

    <dl class="grid grid-cols-2 gap-2 text-sm">
      <div>
        <dt class="text-xs font-medium text-neutral-400 uppercase tracking-wide">{{ $t(`campaign.raised`) }}</dt>
        <dd class="mt-0.5 font-bold text-success-600">
          {{ formatCents(campaign.raisedCents, campaign.currency) }}
        </dd>
      </div>
      <div>
        <dt class="text-xs font-medium text-neutral-400 uppercase tracking-wide">{{ $t(`campaign.goal`) }}</dt>
        <dd class="mt-0.5 font-semibold text-neutral-900">
          {{ formatCents(campaign.goalCents, campaign.currency) }}
        </dd>
      </div>
      <div>
        <dt class="text-xs font-medium text-neutral-400 uppercase tracking-wide">{{ $t(`campaign.deadline`) }}</dt>
        <dd class="mt-0.5 font-medium text-neutral-700">{{ campaign.deadline }}</dd>
      </div>
      <div>
        <dt class="text-xs font-medium text-neutral-400 uppercase tracking-wide">{{ $t(`campaign.donors`) }}</dt>
        <dd class="mt-0.5 font-semibold text-primary-600">{{ campaign.donations.length }}</dd>
      </div>
    </dl>

    <div v-if="!isClosed" class="flex gap-2 pt-1">
      <BaseButton
        v-if="!adminMode"
        variant="primary"
        size="sm"
        class="flex-1"
        @click="emit(`donate`, campaign.id)"
      >
        {{ $t(`campaign.donate`) }}
      </BaseButton>
      <BaseButton
        v-if="adminMode"
        variant="danger"
        size="sm"
        @click="emit(`close`, campaign.id)"
      >
        {{ $t(`campaign.close`) }}
      </BaseButton>
    </div>
  </div>
</template>

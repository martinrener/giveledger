<script lang="ts" setup>
import type { Campaign } from '~/types/campaign'

export interface Props {
  open:     boolean
  campaign: Campaign
}

const { open, campaign } = defineProps<Props>()

const emit = defineEmits<{ confirm: []; close: [] }>()

const { t: $t }       = useI18n()
const { formatCents } = useCurrency()

const goalReached = computed(() => campaign.raisedCents >= campaign.goalCents)
</script>

<template>
  <BaseModal
    :open="open"
    :title="$t(`campaign.confirm_close.title`)"
    @close="emit(`close`)"
  >
    <template #body>
      <p class="text-sm text-neutral-700">
        {{ $t(`campaign.confirm_close.body`, { name: campaign.name }) }}
      </p>

      <div
        v-if="!goalReached"
        class="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
      >
        <span class="mt-0.5 text-amber-500">⚠</span>
        <p class="text-sm text-amber-800">{{ $t(`campaign.confirm_close.warning`) }}</p>
      </div>

      <dl class="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-neutral-50 p-4 text-sm">
        <div>
          <dt class="text-xs text-neutral-400">{{ $t(`campaign.raised`) }}</dt>
          <dd class="font-medium text-neutral-900">
            {{ formatCents(campaign.raisedCents, campaign.currency) }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-neutral-400">{{ $t(`campaign.goal`) }}</dt>
          <dd class="font-medium text-neutral-900">
            {{ formatCents(campaign.goalCents, campaign.currency) }}
          </dd>
        </div>
      </dl>
    </template>
    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="emit(`close`)">
        {{ $t(`common.cancel`) }}
      </BaseButton>
      <BaseButton variant="danger" size="sm" @click="emit(`confirm`)">
        {{ $t(`campaign.confirm_close.cta`) }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

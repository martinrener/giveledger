<script lang="ts" setup>
import type { Campaign } from '~/types/campaign'

export interface Props {
  open:      boolean
  campaign:  Campaign
  loading?:  boolean
}

const { open, campaign, loading = false } = defineProps<Props>()

const emit = defineEmits<{ confirm: []; close: [] }>()

const { t: $t }       = useI18n()
const { formatCents } = useCurrency()
</script>

<template>
  <BaseModal
    :open="open"
    :title="$t(`campaign.confirm_open.title`)"
    @close="emit(`close`)"
  >
    <template #body>
      <p class="text-sm text-neutral-700">
        {{ $t(`campaign.confirm_open.body`, { name: campaign.name }) }}
      </p>
      <dl class="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-neutral-50 p-4 text-sm">
        <div>
          <dt class="text-xs text-neutral-400">{{ $t(`campaign.goal`) }}</dt>
          <dd class="font-medium text-neutral-900">
            {{ formatCents(campaign.goalCents, campaign.currency) }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-neutral-400">{{ $t(`campaign.deadline`) }}</dt>
          <dd class="font-medium text-neutral-900">{{ campaign.deadline }}</dd>
        </div>
      </dl>
    </template>
    <template #footer>
      <BaseButton variant="secondary" size="sm" :disabled="loading" @click="emit(`close`)">
        {{ $t(`common.cancel`) }}
      </BaseButton>
      <BaseButton variant="primary" size="sm" :loading="loading" :disabled="loading" @click="emit(`confirm`)">
        {{ $t(`campaign.confirm_open.cta`) }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

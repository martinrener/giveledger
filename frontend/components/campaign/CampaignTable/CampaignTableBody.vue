<script lang="ts" setup>
import type { Campaign } from '~/types/campaign'

export interface Props {
  campaigns: Campaign[]
  adminMode?: boolean
}

const { campaigns, adminMode = false } = defineProps<Props>()

const emit = defineEmits<{ close: [id: string] }>()

const { t: $t }       = useI18n()
const { formatCents } = useCurrency()
</script>

<template>
  <tbody class="divide-y divide-neutral-100">
    <tr
      v-for="c in campaigns"
      :key="c.id"
      class="hover:bg-neutral-50 transition-colors"
    >
      <td class="px-4 py-3 font-medium text-neutral-900">{{ c.name }}</td>
      <td class="px-4 py-3">
        <BaseBadge :variant="c.status">
          {{ $t(`campaigns.status.${c.status}`) }}
        </BaseBadge>
      </td>
      <td class="px-4 py-3 text-right text-neutral-600">
        {{ formatCents(c.goalCents, c.currency) }}
      </td>
      <td class="px-4 py-3">
        <div class="flex flex-col gap-1">
          <span class="text-neutral-900">{{ formatCents(c.raisedCents, c.currency) }}</span>
          <ProgressBar :raised-cents="c.raisedCents" :goal-cents="c.goalCents" :show-label="false" />
        </div>
      </td>
      <td class="px-4 py-3 text-neutral-600">{{ c.deadline }}</td>
      <td v-if="adminMode" class="px-4 py-3 text-right">
        <BaseButton
          v-if="c.status === `open`"
          variant="danger"
          size="sm"
          @click="emit(`close`, c.id)"
        >
          {{ $t(`campaign.close`) }}
        </BaseButton>
      </td>
    </tr>
  </tbody>
</template>

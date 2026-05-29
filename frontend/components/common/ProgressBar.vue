<script lang="ts" setup>
export interface Props {
  raisedCents: number
  goalCents: number
  showLabel?: boolean
}

const { raisedCents, goalCents, showLabel = true } = defineProps<Props>()

const { t: $t } = useI18n()

const percent = computed(() =>
  goalCents > 0 ? Math.min(100, Math.round((raisedCents / goalCents) * 100)) : 0
)
</script>

<template>
  <div class="w-full">
    <div class="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
      <div
        class="h-2 rounded-full bg-primary-500 transition-all duration-500"
        :style="{ width: `${percent}%` }"
      />
    </div>
    <p v-if="showLabel" class="mt-1 text-xs text-neutral-500">
      {{ $t(`campaign.progress`, { percent }) }}
    </p>
  </div>
</template>

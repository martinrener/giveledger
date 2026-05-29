<script lang="ts" setup>
export interface Props {
  loading?:   boolean
  empty?:     boolean
  emptyText?: string
}

const { loading = false, empty = false, emptyText = `` } = defineProps<Props>()

const { t: $t } = useI18n()
</script>

<template>
  <div class="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white">
    <div v-if="loading" class="flex items-center justify-center py-16 text-sm text-neutral-400">
      {{ $t(`common.loading`) }}
    </div>
    <div v-else-if="empty" class="py-16 text-center text-sm text-neutral-400">
      {{ emptyText }}
    </div>
    <table v-else class="w-full text-sm">
      <slot />
    </table>
  </div>
</template>

<script lang="ts" setup>
export interface Props {
  title: string
}

const { title } = defineProps<Props>()
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <div class="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 class="mb-6 text-xl font-bold text-neutral-900">{{ title }}</h1>
      <slot />
      <div v-if="$slots.footer" class="mt-4 text-center text-sm text-neutral-500">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

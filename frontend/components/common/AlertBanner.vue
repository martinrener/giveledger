<script lang="ts" setup>
export interface Props {
  variant: `success` | `error` | `warning`
}

const { variant } = defineProps<Props>()

const alertCva = cva(`rounded-xl border px-6 py-5`, {
  variants: {
    variant: {
      success: `border-success-200 bg-success-50 text-success-800`,
      error:   `border-red-200 bg-red-50 text-red-800`,
      warning: `border-amber-200 bg-amber-50 text-amber-800`,
    },
  },
})
</script>

<template>
  <div :class="alertCva({ variant })">
    <slot />
  </div>
</template>

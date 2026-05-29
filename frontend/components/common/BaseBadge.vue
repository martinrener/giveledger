<script lang="ts" setup>
export interface Props {
  variant: `open` | `closed` | `neutral`
}

const { variant } = defineProps<Props>()

const badgeCva = cva(
  `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`,
  {
    variants: {
      variant: {
        open:    `bg-success-100 text-success-800`,
        closed:  `bg-neutral-200 text-neutral-600`,
        neutral: `bg-neutral-100 text-neutral-500`,
      },
    },
  },
)
</script>

<template>
  <span :class="badgeCva({ variant })">
    <slot />
  </span>
</template>

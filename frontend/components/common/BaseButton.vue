<script lang="ts" setup>
export interface Props {
  variant?: `primary` | `secondary` | `danger` | `ghost`
  size?: `sm` | `md` | `lg`
  type?: `button` | `submit` | `reset`
  disabled?: boolean
  loading?: boolean
}

const {
  variant = `primary`,
  size = `md`,
  type = `button`,
  disabled = false,
  loading = false,
} = defineProps<Props>()

const buttonCva = cva(
  `inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`,
  {
    variants: {
      variant: {
        primary:   `bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500`,
        secondary: `border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 focus:ring-neutral-400`,
        danger:    `bg-red-500 hover:bg-red-600 text-white focus:ring-red-500`,
        ghost:     `text-neutral-600 hover:bg-neutral-100 focus:ring-neutral-400`,
      },
      size: {
        sm: `px-3 py-1.5 text-sm`,
        md: `px-4 py-2 text-sm`,
        lg: `px-6 py-3 text-base`,
      },
    },
  },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonCva({ variant, size })"
  >
    <span
      v-if="loading"
      class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
    <slot />
  </button>
</template>

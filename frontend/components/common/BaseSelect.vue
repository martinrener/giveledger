<script lang="ts" setup>
export interface SelectOption {
  value: string
  label: string
}

export interface Props {
  modelValue?: string
  label?: string
  options?: SelectOption[]
  state?: `default` | `error` | `disabled`
  errorMessage?: string
  id?: string
  placeholder?: string
}

const {
  modelValue = ``,
  label = ``,
  options = [],
  state = `default`,
  errorMessage = ``,
  id = ``,
  placeholder = ``,
} = defineProps<Props>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const selectCva = cva(
  `block w-full rounded-md border px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 transition-colors`,
  {
    variants: {
      state: {
        default:  `border-neutral-300 focus:ring-primary-500 focus:border-primary-500`,
        error:    `border-red-400 focus:ring-red-500 focus:border-red-500`,
        disabled: `border-neutral-200 bg-neutral-50 cursor-not-allowed opacity-60`,
      },
    },
  },
)
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="id" class="text-sm font-medium text-neutral-700">{{ label }}</label>
    <select
      :id="id"
      :value="modelValue"
      :disabled="state === `disabled`"
      :class="selectCva({ state })"
      @change="emit(`update:modelValue`, ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <p v-if="state === `error` && errorMessage" class="text-xs text-red-600">{{ errorMessage }}</p>
  </div>
</template>

<script lang="ts" setup>
export interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  state?: `default` | `error` | `disabled`
  errorMessage?: string
  id?: string
  type?: string
  min?: string
  max?: string
}

const {
  modelValue = ``,
  label = ``,
  placeholder = ``,
  state = `default`,
  errorMessage = ``,
  id = ``,
  type = `text`,
  min = ``,
  max = ``,
} = defineProps<Props>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const inputCva = cva(
  `block w-full rounded-md border px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-colors`,
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
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="state === `disabled`"
      :min="min || undefined"
      :max="max || undefined"
      :class="inputCva({ state })"
      @input="emit(`update:modelValue`, ($event.target as HTMLInputElement).value)"
    />
    <p v-if="state === `error` && errorMessage" class="text-xs text-red-600">{{ errorMessage }}</p>
  </div>
</template>

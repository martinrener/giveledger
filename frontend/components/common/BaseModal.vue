<script lang="ts" setup>
export interface Props {
  open: boolean
  title?: string
}

const { open, title = `` } = defineProps<Props>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/50"
          @click="emit(`close`)"
        />
        <div class="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl">
          <div
            v-if="title || $slots.header"
            class="border-b border-neutral-100 px-6 py-4"
          >
            <slot name="header">
              <h2 class="text-lg font-semibold text-neutral-900">{{ title }}</h2>
            </slot>
          </div>
          <div class="px-6 py-5">
            <slot name="body" />
          </div>
          <div
            v-if="$slots.footer"
            class="flex justify-end gap-3 border-t border-neutral-100 px-6 py-4"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

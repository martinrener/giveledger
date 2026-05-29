<script lang="ts" setup>
export interface Props {
  adminMode?: boolean
}

const { adminMode = false } = defineProps<Props>()

const { t: $t } = useI18n()
</script>

<template>
  <thead class="border-b border-neutral-200 bg-neutral-50">
    <tr>
      <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {{ $t(`table.name`) }}
      </th>
      <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {{ $t(`table.status`) }}
      </th>
      <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {{ $t(`table.goal`) }}
      </th>
      <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {{ $t(`table.raised`) }}
      </th>
      <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {{ $t(`table.deadline`) }}
      </th>
      <th
        v-if="adminMode"
        class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500"
      >
        {{ $t(`table.actions`) }}
      </th>
    </tr>
  </thead>
</template>

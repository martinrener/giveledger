<script lang="ts" setup>
const { t: $t } = useI18n()
</script>

<template>
  <thead class="border-b border-neutral-200 bg-neutral-50">
    <tr>
      <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {{ $t(`donors.donor`) }}
      </th>
      <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {{ $t(`donors.amount`) }}
      </th>
      <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {{ $t(`donors.date`) }}
      </th>
    </tr>
  </thead>
</template>

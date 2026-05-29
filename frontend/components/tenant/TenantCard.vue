<script lang="ts" setup>
import type { Tenant } from '~/types/campaign'

export interface Props {
  tenant: Tenant
}

const { tenant } = defineProps<Props>()

const { t: $t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
    <div>
      <h3 class="text-base font-semibold text-neutral-900">{{ tenant.name }}</h3>
      <p class="text-xs text-neutral-400">{{ tenant.slug }}</p>
    </div>
    <NuxtLink
      :to="`/donate/${tenant.slug}`"
      class="block"
    >
      <BaseButton variant="primary" size="sm" class="w-full">
        {{ $t(`tenant.visit`) }}
      </BaseButton>
    </NuxtLink>
  </div>
</template>

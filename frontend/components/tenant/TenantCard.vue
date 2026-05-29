<script lang="ts" setup>
import type { Tenant } from '~/types/campaign'

export interface Props {
  tenant: Tenant
}

const { tenant } = defineProps<Props>()

const { t: $t } = useI18n()
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
    <div class="bg-primary-500 px-6 py-5">
      <h3 class="text-xl font-bold text-white">{{ tenant.name }}</h3>
      <p class="mt-0.5 text-sm text-primary-100">{{ tenant.slug }}</p>
    </div>
    <div class="px-6 py-5">
      <NuxtLink :to="`/donate/${tenant.slug}`" class="block">
        <BaseButton variant="primary" size="md" class="w-full">
          {{ $t(`tenant.visit`) }}
        </BaseButton>
      </NuxtLink>
    </div>
  </div>
</template>

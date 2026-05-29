<script lang="ts" setup>
import { storeToRefs } from 'pinia'

const { t: $t } = useI18n()
const store     = useTenantsStore()
const { tenants, loading, error } = storeToRefs(store)

onMounted(store.fetchTenants)
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-2xl font-bold text-neutral-900">{{ $t(`tenant.select`) }}</h1>

    <p v-if="loading" class="text-sm text-neutral-400">{{ $t(`common.loading`) }}</p>

    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <TenantCard v-for="tenant in tenants" :key="tenant.id" :tenant="tenant" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'

const { t: $t } = useI18n()
const store     = useTenantsStore()
const { tenants, loading, error } = storeToRefs(store)

onMounted(store.fetchTenants)
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-neutral-900">{{ $t(`tenant.select`) }}</h1>
      <p class="mt-2 text-sm text-neutral-500">Choose your church to view active campaigns.</p>
    </div>

    <p v-if="loading" class="text-center text-sm text-neutral-400">{{ $t(`common.loading`) }}</p>

    <AlertBanner v-else-if="error" variant="error">{{ error }}</AlertBanner>

    <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <TenantCard v-for="tenant in tenants" :key="tenant.id" :tenant="tenant" />
    </div>

    <div class="mt-4 border-t border-neutral-200 pt-6 text-center">
      <p class="text-sm text-neutral-400">Are you a church administrator?</p>
      <NuxtLink to="/admin" class="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline">
        Go to Admin Panel →
      </NuxtLink>
    </div>
  </div>
</template>

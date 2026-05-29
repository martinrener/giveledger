<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const { t: $t } = useI18n()
const router    = useRouter()
const auth      = useAuthStore()
const { slug, churchName, isAuthenticated } = storeToRefs(auth)

const handleLogout = async () => {
  await auth.logout()
  await router.push(`/admin`)
}
</script>

<template>
  <header class="border-b border-neutral-200 bg-white px-6 py-4">
    <div class="mx-auto flex max-w-5xl items-center justify-between">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="text-sm text-neutral-400 hover:text-neutral-600">
          GiveLedger
        </NuxtLink>
        <span v-if="churchName" class="text-neutral-300">/</span>
        <span v-if="churchName" class="text-sm font-semibold text-neutral-800">
          {{ churchName }}
        </span>
      </div>
      <nav class="flex items-center gap-4">
        <NuxtLink
          v-if="isAuthenticated && slug"
          :to="`/${slug}/dashboard`"
          class="text-sm text-neutral-600 hover:text-neutral-900"
        >
          Dashboard
        </NuxtLink>
        <button
          v-if="isAuthenticated"
          class="text-sm text-neutral-500 hover:text-neutral-800"
          @click="handleLogout"
        >
          {{ $t(`auth.logout`) }}
        </button>
        <NuxtLink
          v-else
          to="/admin"
          class="text-sm text-neutral-500 hover:text-neutral-800"
        >
          {{ $t(`auth.login`) }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

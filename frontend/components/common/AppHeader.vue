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
  <header class="bg-primary-600 px-6 py-4 shadow-sm">
    <div class="mx-auto flex max-w-5xl items-center justify-between">
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="text-sm font-bold tracking-wide text-white/90 hover:text-white">
          GiveLedger
        </NuxtLink>
        <span v-if="churchName" class="text-white/30">/</span>
        <span v-if="churchName" class="text-sm font-semibold text-white">
          {{ churchName }}
        </span>
      </div>

      <nav class="flex items-center gap-3">
        <NuxtLink
          v-if="isAuthenticated && slug"
          :to="`/${slug}/dashboard`"
          class="text-sm font-medium text-white/80 hover:text-white"
        >
          Dashboard
        </NuxtLink>
        <button
          v-if="isAuthenticated"
          class="text-sm text-white/60 hover:text-white"
          @click="handleLogout"
        >
          {{ $t(`auth.logout`) }}
        </button>
        <NuxtLink to="/admin">
          <BaseButton variant="secondary" size="sm">
            {{ $t(`common.admin_panel`) }}
          </BaseButton>
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

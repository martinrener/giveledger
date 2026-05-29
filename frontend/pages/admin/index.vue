<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const { t: $t } = useI18n()
const router    = useRouter()
const auth      = useAuthStore()
const { loading, error, isAuthenticated, slug } = storeToRefs(auth)

const email    = ref(``)
const password = ref(``)

const handleSubmit = async () => {
  await auth.login(email.value, password.value)
  if (isAuthenticated.value && slug.value) {
    await router.push(`/${slug.value}/dashboard`)
  }
}
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <div class="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 class="mb-6 text-xl font-bold text-neutral-900">{{ $t(`auth.login_title`) }}</h1>

      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <BaseInput
          id="email"
          v-model="email"
          type="email"
          :label="$t(`auth.email`)"
          :state="error ? `error` : `default`"
          placeholder="admin@church.org"
        />
        <BaseInput
          id="password"
          v-model="password"
          type="password"
          :label="$t(`auth.password`)"
          :state="error ? `error` : `default`"
          :error-message="error ?? ``"
        />

        <BaseButton type="submit" variant="primary" :loading="loading" class="w-full">
          {{ $t(`auth.login_cta`) }}
        </BaseButton>
      </form>

      <p class="mt-4 text-center text-sm text-neutral-500">
        {{ $t(`auth.no_account`) }}
        <NuxtLink to="/admin/register" class="text-primary-600 hover:underline">
          {{ $t(`auth.register`) }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

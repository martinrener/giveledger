<script lang="ts" setup>
import { storeToRefs } from 'pinia'

const { t: $t } = useI18n()
const auth      = useAuthStore()
const { loading, error } = storeToRefs(auth)

const tenantSlug = ref(``)
const email      = ref(``)
const password   = ref(``)
const succeeded  = ref(false)

const handleSubmit = async () => {
  await auth.register(tenantSlug.value, email.value, password.value)
  if (!error.value) {
    succeeded.value = true
  }
}
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <div class="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 class="mb-6 text-xl font-bold text-neutral-900">{{ $t(`auth.register_title`) }}</h1>

      <div
        v-if="succeeded"
        class="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-800"
      >
        {{ $t(`auth.register_success`) }}
        <NuxtLink to="/admin" class="ml-1 font-medium underline">
          {{ $t(`auth.login_cta`) }}
        </NuxtLink>
      </div>

      <form v-else class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <BaseInput
          id="tenant-slug"
          v-model="tenantSlug"
          :label="$t(`auth.tenant_slug`)"
          :state="error ? `error` : `default`"
          placeholder="my-church"
        />
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
          {{ $t(`auth.register_cta`) }}
        </BaseButton>
      </form>

      <p class="mt-4 text-center text-sm text-neutral-500">
        {{ $t(`auth.have_account`) }}
        <NuxtLink to="/admin" class="text-primary-600 hover:underline">
          {{ $t(`auth.login_cta`) }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

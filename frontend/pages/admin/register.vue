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
  <AuthCard :title="$t(`auth.register_title`)">
    <AlertBanner v-if="succeeded" variant="success" class="mb-4">
      {{ $t(`auth.register_success`) }}
      <NuxtLink to="/admin" class="ml-1 font-medium underline">
        {{ $t(`auth.login_cta`) }}
      </NuxtLink>
    </AlertBanner>

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

    <template #footer>
      {{ $t(`auth.have_account`) }}
      <NuxtLink to="/admin" class="text-primary-600 hover:underline">
        {{ $t(`auth.login_cta`) }}
      </NuxtLink>
    </template>
  </AuthCard>
</template>

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
  <AuthCard :title="$t(`auth.login_title`)">
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

    <template #footer>
      {{ $t(`auth.no_account`) }}
      <NuxtLink to="/admin/register" class="text-primary-600 hover:underline">
        {{ $t(`auth.register`) }}
      </NuxtLink>
    </template>
  </AuthCard>
</template>

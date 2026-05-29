<script lang="ts" setup>
import _ from 'lodash'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const route  = useRoute()
const router = useRouter()
const { t: $t } = useI18n()

const slug  = computed(() => route.params.slug as string)
const store = useCampaignsStore()
const { campaigns, loading, error } = storeToRefs(store)

const search = ref(``)

const filtered = computed(() =>
  _.chain(campaigns.value)
    .filter(c => c.name.toLowerCase().includes(search.value.toLowerCase()))
    .orderBy([`status`, `name`], [`asc`, `asc`])
    .value()
)

const handleDonate = (campaignId: string) => {
  router.push(`/donate/${slug.value}/${campaignId}`)
}

onMounted(() => store.fetchCampaigns(slug.value))
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center gap-3">
      <NuxtLink to="/" class="text-sm text-neutral-500 hover:text-neutral-800">
        ← {{ $t(`common.back`) }}
      </NuxtLink>
    </div>

    <div class="flex items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-neutral-900">{{ $t(`campaigns.title`) }}</h1>
      <BaseInput
        v-model="search"
        :placeholder="$t(`campaigns.search`)"
        class="w-56"
      />
    </div>

    <p v-if="loading" class="text-sm text-neutral-400">{{ $t(`common.loading`) }}</p>

    <AlertBanner v-else-if="error" variant="error">{{ error }}</AlertBanner>

    <p v-else-if="filtered.length === 0" class="text-sm text-neutral-400">
      {{ $t(`campaigns.empty`) }}
    </p>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <CampaignCard
        v-for="c in filtered"
        :key="c.id"
        :campaign="c"
        @donate="handleDonate"
      />
    </div>
  </div>
</template>

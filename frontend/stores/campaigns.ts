import type { Campaign, CreateCampaignPayload, RecordDonationPayload } from '~/types/campaign'

export const useCampaignsStore = defineStore(`campaigns`, () => {
  const campaigns = ref<Campaign[]>([])
  const loading   = ref(false)
  const error     = ref<string | null>(null)

  const api = useApi()

  const fetchCampaigns = async (slug: string) => {
    loading.value = true
    error.value   = null
    try {
      campaigns.value = await api<Campaign[]>(`/api/donate/${slug}/campaigns`)
    } catch (e) {
      error.value = apiError(e, `Failed to load campaigns`)
    } finally {
      loading.value = false
    }
  }

  const fetchAdminCampaigns = async (slug: string) => {
    loading.value = true
    error.value   = null
    try {
      campaigns.value = await api<Campaign[]>(`/api/${slug}/campaigns`)
    } catch (e) {
      error.value = apiError(e, `Failed to load campaigns`)
    } finally {
      loading.value = false
    }
  }

  const recordDonation = async (slug: string, campaignId: string, payload: RecordDonationPayload) => {
    loading.value = true
    error.value   = null
    try {
      await api(`/api/donate/${slug}/campaigns/${campaignId}/donations`, {
        method: `POST`,
        body: {
          donor_name:   payload.donorName,
          amount_cents: payload.amountCents,
          currency:     payload.currency,
        },
      })
    } catch (e) {
      error.value = apiError(e, `Failed to record donation`)
    } finally {
      loading.value = false
    }
  }

  const createCampaign = async (slug: string, payload: CreateCampaignPayload) => {
    loading.value = true
    error.value   = null
    try {
      await api(`/api/${slug}/campaigns`, {
        method: `POST`,
        body: {
          name:       payload.name,
          goal_cents: payload.goalCents,
          currency:   payload.currency,
          deadline:   payload.deadline,
        },
      })
    } catch (e) {
      error.value = apiError(e, `Failed to create campaign`)
    } finally {
      loading.value = false
    }
  }

  const closeCampaign = async (slug: string, campaignId: string) => {
    loading.value = true
    error.value   = null
    try {
      await api(`/api/${slug}/campaigns/${campaignId}/close`, { method: `POST` })
    } catch (e) {
      error.value = apiError(e, `Failed to close campaign`)
    } finally {
      loading.value = false
    }
  }

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    fetchAdminCampaigns,
    recordDonation,
    createCampaign,
    closeCampaign,
  }
})

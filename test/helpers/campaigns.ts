import type { APIResponse } from '@playwright/test'
import type { CampaignApi } from '../api-objects/CampaignApi'
import type { PublicCampaignApi } from '../api-objects/PublicCampaignApi'
import { generateCampaignData } from '../functions/common'
import type { CampaignPayload } from '../functions/common'

export interface Campaign {
    id:          string
    name:        string
    goalCents:   number
    raisedCents: number
    currency:    string
    status:      'open' | 'closed'
    deadline:    string
}

/**
 * Creates a campaign and returns its ID.
 * The create endpoint returns 201 with no body, so we fetch the list
 * and find by name (names are unique per tenant for open campaigns).
 */
export const createCampaign = async (
    api:       CampaignApi,
    overrides: Partial<CampaignPayload> = {},
): Promise<string> => {
    const payload = generateCampaignData(overrides)

    const createRes = await api.create(payload)
    if (createRes.status() !== 201) {
        throw new Error(`createCampaign failed: ${createRes.status()} ${await createRes.text()}`)
    }

    const listRes = await api.list()
    const campaigns: Campaign[] = await listRes.json()
    const created = campaigns.find(c => c.name === payload.name)
    if (!created) {
        throw new Error(`createCampaign: "${payload.name}" not found after creation`)
    }

    return created.id
}

const fetchCampaigns = async (api: { list(): Promise<APIResponse> }, label: string): Promise<Campaign[]> => {
    const res = await api.list()
    if (!res.ok()) throw new Error(`${label} failed: ${res.status()}`)
    return res.json()
}

export const getCampaigns       = (api: CampaignApi):       Promise<Campaign[]> => fetchCampaigns(api, 'getCampaigns')
export const getPublicCampaigns = (api: PublicCampaignApi): Promise<Campaign[]> => fetchCampaigns(api, 'getPublicCampaigns')

export const closeCampaign = async (api: CampaignApi, campaignId: string): Promise<void> => {
    const res = await api.close(campaignId)
    if (!res.ok()) {
        throw new Error(`closeCampaign failed: ${res.status()} ${await res.text()}`)
    }
}

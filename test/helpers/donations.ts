import type { DonationApi } from '../api-objects/DonationApi'
import type { CampaignApi } from '../api-objects/CampaignApi'
import { generateDonationData } from '../functions/common'
import type { DonationPayload } from '../functions/common'
import { createCampaign, closeCampaign } from './campaigns'

export const createDonation = async (
    api:        DonationApi,
    campaignId: string,
    overrides:  Partial<DonationPayload> = {},
): Promise<void> => {
    const payload = generateDonationData(overrides)
    const res = await api.record(campaignId, payload)
    if (res.status() !== 201) {
        throw new Error(`createDonation failed: ${res.status()} ${await res.text()}`)
    }
}

export const donateToNewCampaign = async (
    ctx:       { campaign: CampaignApi; donation: DonationApi },
    overrides: Partial<DonationPayload> = {},
) => {
    const id = await createCampaign(ctx.campaign)
    return ctx.donation.record(id, generateDonationData(overrides))
}

export const recordDonationOnClosedCampaign = async (
    ctx: { campaign: CampaignApi; donation: DonationApi },
) => {
    const id = await createCampaign(ctx.campaign)
    await closeCampaign(ctx.campaign, id)
    return ctx.donation.record(id, generateDonationData())
}

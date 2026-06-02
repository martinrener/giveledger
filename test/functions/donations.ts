import type { BaseAPI } from '../fixtures/BaseAPI'
import { generateDonationData } from './common'
import type { DonationPayload } from './common'

/**
 * Records a donation on an open campaign via the public donate route.
 * The endpoint returns 201 with no body.
 */
export const createDonation = async (
    api:        BaseAPI,
    campaignId: string,
    overrides:  Partial<DonationPayload> = {},
): Promise<void> => {
    const payload = generateDonationData(overrides)
    const res = await api.donatePost(`/campaigns/${campaignId}/donations`, { data: payload })
    if (res.status() !== 201) {
        throw new Error(`createDonation failed: ${res.status()} ${await res.text()}`)
    }
}

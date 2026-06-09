import { BaseApiObject } from '../fixtures/BaseApiObject'
import type { DonationPayload } from '../functions/common'

export class DonationApi extends BaseApiObject {
    record(campaignId: string, data: DonationPayload) {
        return this.donatePost(`/campaigns/${campaignId}/donations`, { data })
    }
}

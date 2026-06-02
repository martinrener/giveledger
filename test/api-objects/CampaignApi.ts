import type { BaseAPI } from '../fixtures/BaseAPI'
import type { CampaignPayload } from '../functions/common'

export class CampaignApi {
    constructor(private readonly api: BaseAPI) {}

    create(data: CampaignPayload) {
        return this.api.adminPost('/campaigns', { data })
    }

    list() {
        return this.api.adminGet('/campaigns')
    }

    close(campaignId: string) {
        return this.api.adminPost(`/campaigns/${campaignId}/close`)
    }

    listPublic() {
        return this.api.donateGet('/campaigns')
    }
}

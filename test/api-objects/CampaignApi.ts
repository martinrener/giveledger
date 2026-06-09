import { BaseApiObject } from '../fixtures/BaseApiObject'
import type { CampaignPayload } from '../functions/common'

export class CampaignApi extends BaseApiObject {
    create(data: CampaignPayload) {
        return this.adminPost('/campaigns', { data })
    }

    list() {
        return this.adminGet('/campaigns')
    }

    close(campaignId: string) {
        return this.adminPost(`/campaigns/${campaignId}/close`)
    }

    listPublic() {
        return this.donateGet('/campaigns')
    }

    // Cross-tenant methods — used in isolation tests to attempt access on a foreign slug
    listAs(slug: string) {
        return this.get(`/${slug}/campaigns`)
    }

    createAs(slug: string, data: CampaignPayload) {
        return this.post(`/${slug}/campaigns`, { data })
    }

    closeAs(slug: string, campaignId: string) {
        return this.post(`/${slug}/campaigns/${campaignId}/close`)
    }
}

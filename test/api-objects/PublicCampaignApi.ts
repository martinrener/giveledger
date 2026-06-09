import { BaseApiObject } from '../fixtures/BaseApiObject'

export class PublicCampaignApi extends BaseApiObject {
    list() {
        return this.donateGet('/campaigns')
    }

    listBySlug(slug: string) {
        return this.get(`/donate/${slug}/campaigns`)
    }
}

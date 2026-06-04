import type { BaseAPI } from '../fixtures/BaseAPI'
import type { CampaignPayload } from '../functions/common'

// Declaration merging: CampaignApi instances get all BaseAPI methods at the type level.
// The Proxy in the constructor forwards unknown property access to the inner api at runtime,
// bound so BaseAPI internals receive the correct `this`.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging
export interface CampaignApi extends BaseAPI {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class CampaignApi {
    constructor(private readonly api: BaseAPI) {
        return new Proxy(this, {
            get(target, prop, receiver) {
                if (prop in target) {
                    return Reflect.get(target, prop, receiver)
                }
                const value = (api as unknown as Record<string | symbol, unknown>)[prop]
                return typeof value === 'function'
                    ? (value as (...args: unknown[]) => unknown).bind(api)
                    : value
            },
        }) as this
    }

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

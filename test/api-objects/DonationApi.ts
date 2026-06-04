import type { BaseAPI } from '../fixtures/BaseAPI'
import type { DonationPayload } from '../functions/common'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging
export interface DonationApi extends BaseAPI {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class DonationApi {
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

    record(campaignId: string, data: DonationPayload) {
        return this.donatePost(`/campaigns/${campaignId}/donations`, { data })
    }
}

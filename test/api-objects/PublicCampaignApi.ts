import type { BaseAPI } from '../fixtures/BaseAPI'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging
export interface PublicCampaignApi extends BaseAPI {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class PublicCampaignApi {
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

    list() {
        return this.donateGet('/campaigns')
    }

    listBySlug(slug: string) {
        return this.get(`/donate/${slug}/campaigns`)
    }
}

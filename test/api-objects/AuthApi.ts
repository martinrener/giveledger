import type { BaseAPI } from '../fixtures/BaseAPI'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging
export interface AuthApi extends BaseAPI {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class AuthApi {
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

    login(email: string, password: string) {
        return this.post('/auth/login', { data: { email, password } })
    }

    logout() {
        return this.post('/auth/logout', {})
    }

    register(tenantSlug: string, email: string, password: string) {
        return this.post('/auth/register', { data: { tenant_slug: tenantSlug, email, password } })
    }
}

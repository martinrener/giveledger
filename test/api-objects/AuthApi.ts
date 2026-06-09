import { BaseApiObject } from '../fixtures/BaseApiObject'

export class AuthApi extends BaseApiObject {
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

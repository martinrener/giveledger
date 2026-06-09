import { BaseApiObject } from '../fixtures/BaseApiObject'

export class TenantApi extends BaseApiObject {
    list() {
        return this.get('/tenants')
    }
}

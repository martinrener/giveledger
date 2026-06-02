import type { Page } from '@playwright/test'
import { BaseAPI } from './BaseAPI'

export class BasePage {
    public page: Page
    public api: BaseAPI | null = null

    constructor(page: Page) {
        this.page = page
        return new Proxy(this, {
            get(target, prop) {
                if (prop in target) {
                    return target[prop as keyof BasePage]
                }
                const val = (target.page as unknown as Record<string, unknown>)[prop as string]
                return typeof val === 'function' ? (val as Function).bind(target.page) : val
            },
        })
    }

    async goToBasePage(): Promise<void> {
        await this.page.getByRole('link', { name: 'GiveLedger' }).click()
    }

    async initAPI(email: string, password: string): Promise<BaseAPI> {
        if (!this.api) {
            this.api = new BaseAPI()
            await this.api.init(email, password)
        }
        return this.api
    }

    async dispose(): Promise<void> {
        await this.api?.dispose()
    }
}

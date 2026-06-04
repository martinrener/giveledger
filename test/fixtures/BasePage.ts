import type { Page } from '@playwright/test'

// Declaration merging: tells TypeScript that BasePage (and all subclasses) have all Page
// methods. The Proxy in the constructor delegates unknown property access to the inner
// page at runtime, bound so Playwright internals receive the correct `this`.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging
export interface BasePage extends Page {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class BasePage {
    readonly page: Page

    constructor(page: Page) {
        this.page = page
        return new Proxy(this, {
            get(target, prop, receiver) {
                if (prop in target) {
                    return Reflect.get(target, prop, receiver)
                }
                const value = (page as unknown as Record<string | symbol, unknown>)[prop]
                return typeof value === 'function'
                    ? (value as (...args: unknown[]) => unknown).bind(page)
                    : value
            },
        }) as this
    }
}

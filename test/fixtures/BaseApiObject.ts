import type { BaseAPI } from './BaseAPI'

// Declaration merging: BaseApiObject instances get all BaseAPI methods at the type level.
// The Proxy in the constructor forwards unknown property access to the inner api at runtime,
// bound so BaseAPI internals receive the correct `this`.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging
export interface BaseApiObject extends BaseAPI {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class BaseApiObject {
    constructor(protected readonly api: BaseAPI) {
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
}

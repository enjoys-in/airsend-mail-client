/**
 * Runtime configuration singleton.
 *
 * On the **server** `process.env` is available directly, so the getters
 * fall through to it automatically.
 *
 * On the **client** the values are injected by `<RuntimeConfigProvider>`
 * (rendered in the root server layout) *before* any child component mounts,
 * so every `Security` instance already has access to the keys.
 *
 * This keeps `ENCRYPTION_KEY` and `APP_SECRET` out of the static JS bundle.
 */

let _encryptionKey = ""
let _appSecret = ""

export interface RuntimeConfig {
    encryptionKey: string
    appSecret: string
}

/** Called once by RuntimeConfigProvider (client) at render time. */
export function setRuntimeConfig(config: RuntimeConfig) {
    _encryptionKey = config.encryptionKey
    _appSecret = config.appSecret
}

/**
 * Read the current runtime config.
 * - Server: falls back to `process.env` (always available).
 * - Client: uses the value injected by the provider.
 */
export function getRuntimeConfig(): RuntimeConfig {
    return {
        encryptionKey: _encryptionKey || process.env.ENCRYPTION_KEY || "",
        appSecret: _appSecret || process.env.APP_SECRET || "",
    }
}

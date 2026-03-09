import { z } from 'zod'

declare global {
    interface Window {
        __RUNTIME_CONFIG__?: Record<string, string>
    }
}

/** Read an env var at runtime — works on both server and client. */
export function env(key: string): string {
    if (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__) {
        return window.__RUNTIME_CONFIG__[key] || ''
    }
    return process.env[key] || ''
}

const envSchema = z.object({
    BASE_URL: z.string().url(),
    GQL_URL: z.string().url(),
    APP_ENV: z.string().url(),
    APP_URL: z.string().url(),
})
const config = {
    MODE: env('APP_ENV'),
    APP: {
        APP_URL: "https://airsend.in",
        BASE_URL: env('APP_URL'),
        API_URL: env('APP_URL') + "/api/v1",
        APP_ENV: env('APP_ENV'),
        API_KEY: env('API_KEY'),
    }
}
const envParsed = envSchema.safeParse(config.APP)


export const __config = Object.freeze(config)
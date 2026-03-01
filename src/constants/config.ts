import { z } from 'zod'

const envSchema = z.object({
    BASE_URL: z.string().url(),
    GQL_URL: z.string().url(),
    APP_ENV: z.string().url(),
    APP_URL: z.string().url(),
})
const config = {
    MODE: process.env.NEXT_PUBLIC_APP_ENV,
    APP: {
        APP_URL: "https://airsend.in",
        BASE_URL: process.env.NEXT_PUBLIC_APP_URL,
        API_URL: process.env.NEXT_PUBLIC_APP_URL + "/api/v1",
        APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
        API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    }
}
const envParsed = envSchema.safeParse(config.APP)


export const __config = Object.freeze(config)
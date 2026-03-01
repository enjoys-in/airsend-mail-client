"use client"

import { useRef } from "react"
import { setRuntimeConfig } from "@/lib/runtime-config"

/**
 * Injects server-side env vars into the client runtime config singleton.
 *
 * Rendered in the root layout (server component) which reads the env vars
 * and passes them as props. The setter runs synchronously during the first
 * render pass — before any child component mounts — so `Security` and
 * other consumers already have access to the keys.
 */
export function RuntimeConfigProvider({
    encryptionKey,
    appSecret,
    children,
}: {
    encryptionKey: string
    appSecret: string
    children: React.ReactNode
}) {
    const initialized = useRef(false)
    if (!initialized.current) {
        setRuntimeConfig({ encryptionKey, appSecret })
        initialized.current = true
    }
    return <>{children}</>
}

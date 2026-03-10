"use client"

import { useRef } from "react"
import { setSecurityConfig } from "@/lib/security"

/**
 * RuntimeConfigProvider — receives secrets from the server component (layout.tsx)
 * and stores them in module-level memory via setSecurityConfig().
 * No network calls needed — secrets are passed as props from the server.
 */
export function RuntimeConfigProvider({
    appSecret,
    encryptionKey,
    children,
}: {
    appSecret: string
    encryptionKey: string
    children: React.ReactNode
}) {
    const initialized = useRef(false)
    if (!initialized.current) {
        initialized.current = true
        setSecurityConfig({ appSecret, encryptionKey })
    }
    return <>{children}</>
}

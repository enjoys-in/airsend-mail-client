"use client"

import { useRef } from "react"
import { ensureEncryptionKey } from "@/lib/security"

/**
 * RuntimeConfigProvider — fetches the encryption key once on mount.
 * The key is stored in module-level memory (not in HTML source or window globals).
 * All AES encrypt/decrypt happens client-side with zero latency after init.
 */
export function RuntimeConfigProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const initialized = useRef(false)
    if (!initialized.current) {
        initialized.current = true
        ensureEncryptionKey()
    }
    return <>{children}</>
}

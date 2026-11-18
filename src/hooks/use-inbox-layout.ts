"use client"

import { useSyncExternalStore } from "react"
import { useSettingsStore } from "@/store/settings"

export type InboxLayout = "column" | "row"

function readLocal(): InboxLayout | null {
    try {
        const v = localStorage.getItem("airsend_inbox_layout")
        return v === "row" || v === "column" ? v : null
    } catch {
        return null
    }
}

function subscribe(cb: () => void) {
    window.addEventListener("airsend-appearance-updated", cb)
    window.addEventListener("storage", cb)
    return () => {
        window.removeEventListener("airsend-appearance-updated", cb)
        window.removeEventListener("storage", cb)
    }
}

/**
 * Inbox layout: "row" = list, "column" = 2-column split.
 *
 * The saved server setting wins. Until settings have loaded (the store is null
 * on a fresh page load), use the last layout saved on this device, then the
 * 2-column default — so a user who chose "list" never sees a flash of 2-column.
 */
export function useInboxLayout(): InboxLayout {
    const saved = useSettingsStore((s) => s.settings?.personalization?.layout)
    const local = useSyncExternalStore(subscribe, readLocal, () => null)
    if (saved) return saved === "list" ? "row" : "column"
    return local ?? "column"
}

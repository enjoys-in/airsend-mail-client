"use client"

import React, { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface DomainFaviconProps {
    email: string
    initials: string
    colorClass: string
}

/**
 * Extracts domain from email and displays the domain's favicon.
 * Uses Google's favicon CDN (globally cached, no extra API needed).
 * Falls back to initials if image fails to load.
 */
export const DomainFavicon = React.memo(({ email, initials, colorClass }: DomainFaviconProps) => {
    const [imgFailed, setImgFailed] = useState(false)

    const domain = React.useMemo(() => {
        const parts = email.split("@")
        return parts.length > 1 ? parts[1]?.toLowerCase() : null
    }, [email])

    const faviconUrl = React.useMemo(() => {
        if (!domain) return null
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    }, [domain])

    return (
        <Avatar className="h-9 w-9">
            {faviconUrl && !imgFailed && (
                <AvatarImage
                    src={faviconUrl}
                    alt={domain ?? ""}
                    onError={() => setImgFailed(true)}
                    className="object-contain p-1"
                />
            )}
            <AvatarFallback className={cn("text-xs font-semibold", colorClass)}>
                {initials}
            </AvatarFallback>
        </Avatar>
    )
})

DomainFavicon.displayName = "DomainFavicon"

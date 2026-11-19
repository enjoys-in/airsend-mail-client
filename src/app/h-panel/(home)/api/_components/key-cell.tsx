"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import CopyToClipboard from "@/components/common/copyToClipboard"

/**
 * A credential in monospace with copy. `reveal` adds an eye toggle that swaps the masked value for the real one
 * (the API key is stored in the clear and is shown to its owner; the secret is only ever a hash, so it has no reveal).
 */
export function KeyCell({ value, copyValue, reveal }: { value: string; copyValue?: string; reveal?: boolean }) {
    const [shown, setShown] = React.useState(false)
    const masked = reveal ? `${value.substring(0, 10)}••••••••` : "••••••••••••••••••••"

    return (
        <div className="flex items-center gap-1">
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{reveal && shown ? value : masked}</code>
            {reveal && (
                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground" onClick={() => setShown((v) => !v)}>
                    {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{shown ? "Hide key" : "Show key"}</span>
                </Button>
            )}
            <CopyToClipboard text={copyValue ?? value} />
        </div>
    )
}

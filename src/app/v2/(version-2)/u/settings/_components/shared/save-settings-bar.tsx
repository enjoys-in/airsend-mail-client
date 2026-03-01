"use client"

import { memo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SaveSettingsBarProps {
    onSave: () => void
    onReset?: () => void
    isSaving?: boolean
    show?: boolean
    label?: string
}

/**
 * A fixed bottom bar with Save / Reset buttons.
 * Shown at the bottom-center of the viewport.
 */
function SaveSettingsBar({
    onSave,
    onReset,
    isSaving = false,
    show = true,
    label = "Save Settings",
}: SaveSettingsBarProps) {
    if (!show) return null

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-3 bg-background/95 backdrop-blur border rounded-lg shadow-lg px-4 py-2">
                {onReset && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onReset}
                        disabled={isSaving}
                    >
                        Reset
                    </Button>
                )}
                <Button
                    type="button"
                    size="sm"
                    onClick={onSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving…
                        </>
                    ) : (
                        label
                    )}
                </Button>
            </div>
        </div>
    )
}

export default memo(SaveSettingsBar)

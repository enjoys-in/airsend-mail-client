"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Check, RotateCcw } from "lucide-react"

interface SaveSettingsBarProps {
    onSave: () => void
    onReset?: () => void
    isSaving?: boolean
    show?: boolean
    label?: string
}

/**
 * A floating bottom bar with Save and Reset actions.
 * Appears whenever settings have unsaved changes.
 * Responsive, glassmorphic, and touch-accessible.
 */
function SaveSettingsBar({
    onSave,
    onReset,
    isSaving = false,
    show = true,
    label = "Save Changes",
}: SaveSettingsBarProps) {
    if (!show) return null

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-3 bg-background/95 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl px-4 py-2.5 sm:px-5 sm:py-3">
                <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-border/60">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                        Unsaved changes
                    </span>
                </div>
                {onReset && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onReset}
                        disabled={isSaving}
                        className="h-8 sm:h-9 px-3 text-xs sm:text-sm rounded-xl hover:bg-muted font-normal"
                    >
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                        Reset
                    </Button>
                )}
                <Button
                    type="button"
                    size="sm"
                    onClick={onSave}
                    disabled={isSaving}
                    className="h-8 sm:h-9 px-4 text-xs sm:text-sm rounded-xl shadow-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            Saving…
                        </>
                    ) : (
                        <>
                            <Check className="h-3.5 w-3.5 mr-1.5" />
                            {label}
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

export default memo(SaveSettingsBar)

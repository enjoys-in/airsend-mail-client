"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { API } from "@/lib/api/handler"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Pill, Section } from "@/components/h-panel/kit"

interface WorkspaceToggleProps {
    domainId: string
    domainName: string
    initialEnabled: boolean
}

export function WorkspaceToggle({ domainId, domainName, initialEnabled }: WorkspaceToggleProps) {
    const { toast } = useToast()
    const [enabled, setEnabled] = useState(initialEnabled)
    const [loading, setLoading] = useState(false)

    const handleToggle = async (checked: boolean) => {
        setLoading(true)
        try {
            const { data } = await API.toggleWorkspace({ domain_id: domainId, enabled: checked })
            if (!data.success) throw new Error(data.message)
            setEnabled(checked)
            toast({ title: data.message })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Section
            title="Workspace"
            description="A shared workspace for the members of this domain."
            actions={<Pill tone={enabled ? "green" : "neutral"}>{enabled ? "Active" : "Off"}</Pill>}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium">
                        {enabled ? "Workspace is active" : "Enable workspace for this domain"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {enabled
                            ? `${domainName} Workspace — members can access shared features`
                            : "Activating creates a workspace where you can add members with scoped access"
                        }
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    <Switch checked={enabled} onCheckedChange={handleToggle} disabled={loading} />
                </div>
            </div>
            {enabled && (
                <div className="mt-4 border-t border-border/70 pt-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/h-panel/workspace/${domainId}`}>Manage members and scopes</Link>
                    </Button>
                </div>
            )}
        </Section>
    )
}

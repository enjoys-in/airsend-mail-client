"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { API } from "@/lib/api/handler"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"

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
        <Card>
            <CardHeader>
                <CardTitle>Workspace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
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
                    <div className="flex items-center gap-3">
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        <Switch checked={enabled} onCheckedChange={handleToggle} disabled={loading} />
                    </div>
                </div>
                {enabled && (
                    <Link href={`/h-panel/workspace/${domainId}`}>
                        <Button variant="outline" size="sm" className="rounded-none">
                            Manage Members & Scopes
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    )
}

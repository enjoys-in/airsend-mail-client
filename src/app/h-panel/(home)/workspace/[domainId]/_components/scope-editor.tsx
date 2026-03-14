"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"
import { SCOPE_FEATURES, SCOPE_PERMISSIONS, type Scope, type ScopeFeature, type ScopePermission } from "@/lib/types/workspace.interface"
import { buildScope, parseScope } from "@/lib/workspace-utils"

interface ScopeEditorProps {
    memberId: number
    scopes: Scope[]
    onScopesUpdated: (memberId: number, scopes: Scope[]) => void
}

export function ScopeEditor({ memberId, scopes, onScopesUpdated }: ScopeEditorProps) {
    const { toast } = useToast()
    const [updating, setUpdating] = useState<ScopeFeature | null>(null)

    const getScopePermission = (feature: ScopeFeature): ScopePermission => {
        const scope = scopes.find(s => s.startsWith(feature + ":"))
        return scope ? (scope.split(":")[1] as ScopePermission) : "ro"
    }

    const handleChange = async (feature: ScopeFeature, permission: ScopePermission) => {
        const newScopes = scopes
            .filter(s => !s.startsWith(feature + ":"))
            .concat(buildScope(feature, permission) as Scope)

        setUpdating(feature)
        try {
            const { data } = await API.updateWorkspaceMemberScopes(memberId, { scopes: newScopes })
            if (!data.success) throw new Error(data.message)
            onScopesUpdated(memberId, newScopes)
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setUpdating(null)
        }
    }

    return (
        <div className="flex flex-wrap gap-2">
            {SCOPE_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground capitalize w-16">{feature}</span>
                    <Select
                        value={getScopePermission(feature)}
                        onValueChange={(v) => handleChange(feature, v as ScopePermission)}
                        disabled={updating === feature}
                    >
                        <SelectTrigger className="h-7 w-[100px] text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SCOPE_PERMISSIONS.map((p) => (
                                <SelectItem key={p.value} value={p.value} className="text-xs">
                                    {p.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ))}
        </div>
    )
}

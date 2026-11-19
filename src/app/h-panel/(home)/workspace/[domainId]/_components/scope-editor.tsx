"use client"

import { useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"
import { SCOPE_FEATURES, SCOPE_PERMISSIONS, type Scope, type ScopeFeature, type ScopePermission } from "@/lib/types/workspace.interface"
import { buildScope } from "@/lib/workspace-utils"

interface ScopeEditorProps {
    memberId: number
    scopes: Scope[]
    onScopesUpdated: (memberId: number, scopes: Scope[]) => void
}

/** "Edit access": one row per module; each change is saved straight away (same as before). */
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
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs shadow-none">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Edit access
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[300px] space-y-1 p-3">
                <p className="px-1 pb-1 text-xs text-muted-foreground">What this member can do in each module. Changes save immediately.</p>
                {SCOPE_FEATURES.map((feature) => (
                    <div key={feature} className="flex items-center justify-between gap-3 rounded-md px-1 py-1">
                        <span className="text-sm capitalize">{feature}</span>
                        <Select
                            value={getScopePermission(feature)}
                            onValueChange={(v) => handleChange(feature, v as ScopePermission)}
                            disabled={updating === feature}
                        >
                            <SelectTrigger className="h-8 w-[130px] text-xs">
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
            </PopoverContent>
        </Popover>
    )
}

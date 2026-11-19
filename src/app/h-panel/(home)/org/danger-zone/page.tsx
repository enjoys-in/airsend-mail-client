"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { API } from "@/lib/api/handler"
import type { IOrganization } from "../_lib/types"
import { OrgPage, PageHeader, Panel } from "../_components/kit"

export default function DangerZonePage() {
    const [confirmText, setConfirmText] = React.useState("")
    const [selectedOrg, setSelectedOrg] = React.useState("")
    const [organizations, setOrganizations] = React.useState<IOrganization[]>([])

    React.useEffect(() => {
        API.getOrganizations()
            .then((res) => setOrganizations(res.data?.result || res.data || []))
            .catch(() => {})
    }, [])

    const isDeleteEnabled = confirmText === "DELETE" && selectedOrg
    const selectedName = organizations.find((o) => o.id === selectedOrg)?.name ?? selectedOrg

    const handleDelete = async () => {
        try {
            await API.deleteOrganization(selectedOrg)
            setOrganizations((prev) => prev.filter((o) => o.id !== selectedOrg))
        } catch (err) {
            console.error(err)
        }
        setConfirmText("")
        setSelectedOrg("")
    }

    return (
        <OrgPage narrow>
            <PageHeader title="Danger zone" description="Actions here cannot be undone. Take a moment before you confirm." />

            <Panel className="border-red-500/30">
                <div className="space-y-1 border-b border-red-500/20 px-5 py-4">
                    <h2 className="text-sm font-medium">Delete an organization</h2>
                    <p className="text-xs text-muted-foreground">
                        Permanently deletes the organization with its domains, user accounts, settings and configuration.
                    </p>
                </div>

                <div className="space-y-4 p-5">
                    <div className="space-y-2">
                        <Label>Organization</Label>
                        <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                            <SelectTrigger className="max-w-sm">
                                <SelectValue placeholder="Choose an organization..." />
                            </SelectTrigger>
                            <SelectContent>
                                {organizations.map((org) => (
                                    <SelectItem key={org.id} value={org.id}>
                                        {org.id} — {org.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Type <span className="font-mono text-foreground">DELETE</span> to confirm
                        </Label>
                        <Input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="DELETE"
                            className="max-w-[200px] font-mono"
                        />
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                disabled={!isDeleteEnabled}
                                className="border-red-500/40 text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400"
                            >
                                Delete organization
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete <strong>{selectedName}</strong> and all of its data. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>
                                    Yes, delete organization
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </Panel>
        </OrgPage>
    )
}

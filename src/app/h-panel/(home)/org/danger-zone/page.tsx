"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
        <div className="flex flex-col h-full">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <h1 className="text-lg font-semibold">Danger Zone</h1>
            </header>
            <div className="flex-1 p-4 space-y-4 min-w-0 overflow-auto">
                <Card className="border-destructive/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Organization
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                <strong className="text-destructive">Warning:</strong> This action cannot be undone. Deleting an organization will:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                                <li>Permanently delete the organization and all its data</li>
                                <li>Delete all associated domains</li>
                                <li>Delete all user accounts within the organization</li>
                                <li>Remove all settings and configurations</li>
                            </ul>
                        </div>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Select Organization to Delete</Label>
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
                                <Label>Type <span className="font-mono font-bold">DELETE</span> to confirm</Label>
                                <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Type DELETE to confirm" className="max-w-[200px]" />
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={!isDeleteEnabled} className="w-full max-w-[200px]">
                                        Delete Organization
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
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

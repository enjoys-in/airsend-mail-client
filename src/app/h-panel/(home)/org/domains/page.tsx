"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Globe,
    Plus,
    MoreHorizontal,
    Check,
    X,
    AlertTriangle,
    Shield,
    Settings,
    Trash2,
    RefreshCw,
    Building2,
    Search,
} from "lucide-react"
import type { IDomain } from "../_lib/types"
import { API } from "@/lib/api/handler"
import type { IOrganization } from "../_lib/types"

type VerifyField = "dns_verified" | "mx_verified" | "spf_verified" | "dkim_verified" | "dmarc_verified"

const VERIFY_LABELS: Record<VerifyField, string> = {
    dns_verified: "DNS",
    mx_verified: "MX",
    spf_verified: "SPF",
    dkim_verified: "DKIM",
    dmarc_verified: "DMARC",
}

function VerifyBadge({ ok }: { ok: boolean }) {
    return ok ? (
        <Badge variant="default" className="gap-1 text-[10px] bg-emerald-600">
            <Check className="h-3 w-3" /> Verified
        </Badge>
    ) : (
        <Badge variant="secondary" className="gap-1 text-[10px]">
            <X className="h-3 w-3" /> Pending
        </Badge>
    )
}

export default function DomainsPage() {
    const [domains, setDomains] = React.useState<IDomain[]>([])
    const [organizations, setOrganizations] = React.useState<IOrganization[]>([])
    const [loading, setLoading] = React.useState(true)
    const [search, setSearch] = React.useState("")

    React.useEffect(() => {
        Promise.all([
            API.handleGetAllDomains().then((res) => res.data?.result || res.data || []),
            API.getOrganizations().then((res) => res.data?.result || res.data || []),
        ]).then(([d, o]) => {
            setDomains(d)
            setOrganizations(o)
        }).catch(() => {}).finally(() => setLoading(false))
    }, [])
    const [statusFilter, setStatusFilter] = React.useState<string>("all")
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
    const [selectedDomain, setSelectedDomain] = React.useState<IDomain | null>(null)
    const [deleteTarget, setDeleteTarget] = React.useState<IDomain | null>(null)

    // Add form state
    const [newDomain, setNewDomain] = React.useState("")
    const [newDomainOrg, setNewDomainOrg] = React.useState("")

    // Settings form state
    const [settingsOrg, setSettingsOrg] = React.useState("")
    const [settingsCatchAll, setSettingsCatchAll] = React.useState(false)
    const [settingsAutoSync, setSettingsAutoSync] = React.useState(true)

    const filtered = React.useMemo(() => {
        return domains.filter((d) => {
            const matchSearch =
                !search ||
                d.domain_name.toLowerCase().includes(search.toLowerCase()) ||
                d.org_name?.toLowerCase().includes(search.toLowerCase())
            const matchStatus = statusFilter === "all" || d.status === statusFilter
            return matchSearch && matchStatus
        })
    }, [domains, search, statusFilter])

    const handleAddDomain = async () => {
        if (!newDomain.trim()) return
        try {
            const effectiveOrg = newDomainOrg && newDomainOrg !== "none" ? newDomainOrg : null
            const { data } = await API.addNewDomain({ domain_name: newDomain.trim().toLowerCase(), org_id: effectiveOrg })
            const domain = data?.result || {
                id: `dom_${Date.now()}`,
                domain_name: newDomain.trim().toLowerCase(),
                org_id: effectiveOrg,
                org_name: effectiveOrg ? organizations.find((o) => o.id === effectiveOrg)?.name ?? null : null,
                status: "pending",
                dns_verified: false,
                mx_verified: false,
                spf_verified: false,
                dkim_verified: false,
                dmarc_verified: false,
                accounts_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
            setDomains((prev) => [domain, ...prev])
        } catch (err) {
            console.error(err)
        }
        setNewDomain("")
        setNewDomainOrg("")
        setIsAddOpen(false)
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            await API.deleteDomain(deleteTarget.id)
            setDomains((prev) => prev.filter((d) => d.id !== deleteTarget.id))
        } catch (err) {
            console.error(err)
        }
        setDeleteTarget(null)
    }

    const openSettings = (domain: IDomain) => {
        setSelectedDomain(domain)
        setSettingsOrg(domain.org_id || "")
        setSettingsCatchAll(false)
        setSettingsAutoSync(true)
        setIsSettingsOpen(true)
    }

    const handleSaveSettings = async () => {
        if (!selectedDomain) return
        try {
            const effectiveOrg = settingsOrg && settingsOrg !== "none" ? settingsOrg : null
            await API.updateDomain(selectedDomain.id, { org_id: effectiveOrg, catch_all: settingsCatchAll, auto_sync: settingsAutoSync })
            const org = effectiveOrg ? organizations.find((o) => o.id === effectiveOrg) : null
            setDomains((prev) =>
                prev.map((d) =>
                    d.id === selectedDomain.id
                        ? {
                              ...d,
                              org_id: effectiveOrg,
                              org_name: org?.name ?? null,
                              updated_at: new Date().toISOString(),
                          }
                        : d
                )
            )
        } catch (err) {
            console.error(err)
        }
        setIsSettingsOpen(false)
    }

    const handleVerify = async (domainId: string) => {
        try {
            const { data } = await API.verifyDomain(domainId)
            const result = data?.result
            if (result) {
                setDomains((prev) => prev.map((d) => d.id === domainId ? { ...d, ...result } : d))
            }
        } catch (err) {
            console.error(err)
        }
    }

    const statusColor: Record<string, string> = {
        active: "bg-emerald-600",
        pending: "bg-yellow-600",
        inactive: "bg-neutral-500",
        suspended: "bg-red-600",
    }

    return (
        <div className="flex flex-col h-full">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <h1 className="text-lg font-semibold">Domain Management</h1>
                <div className="ml-auto">
                    <Button size="sm" onClick={() => setIsAddOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Domain
                    </Button>
                </div>
            </header>

            <div className="flex-1 p-4 space-y-4 min-w-0 overflow-auto">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search domains..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                    <Badge variant="outline" className="text-xs">
                        {filtered.length} domain{filtered.length !== 1 ? "s" : ""}
                    </Badge>
                </div>

                {/* Table */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Globe className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium mb-1">No domains found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {search || statusFilter !== "all"
                                ? "Try adjusting your search or filter."
                                : "Add your first domain to get started."}
                        </p>
                    </div>
                ) : (
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Domain</TableHead>
                                    <TableHead className="hidden sm:table-cell">Organization</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden md:table-cell">DNS</TableHead>
                                    <TableHead className="hidden md:table-cell">MX</TableHead>
                                    <TableHead className="hidden lg:table-cell">SPF</TableHead>
                                    <TableHead className="hidden lg:table-cell">DKIM</TableHead>
                                    <TableHead className="hidden lg:table-cell">DMARC</TableHead>
                                    <TableHead className="hidden sm:table-cell text-center">Accounts</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((d) => (
                                    <TableRow key={d.id}>
                                        <TableCell className="font-medium">{d.domain_name}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {d.org_name ? (
                                                <span className="flex items-center gap-1.5 text-sm">
                                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {d.org_name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${statusColor[d.status]} text-white text-[10px]`}>
                                                {d.status}
                                            </Badge>
                                        </TableCell>
                                        {(["dns_verified", "mx_verified"] as VerifyField[]).map(
                                            (field) => (
                                                <TableCell key={field} className="hidden md:table-cell">
                                                    {d[field] ? (
                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                    ) : (
                                                        <X className="h-4 w-4 text-muted-foreground/40" />
                                                    )}
                                                </TableCell>
                                            )
                                        )}
                                        {(["spf_verified", "dkim_verified", "dmarc_verified"] as VerifyField[]).map(
                                            (field) => (
                                                <TableCell key={field} className="hidden lg:table-cell">
                                                    {d[field] ? (
                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                    ) : (
                                                        <X className="h-4 w-4 text-muted-foreground/40" />
                                                    )}
                                                </TableCell>
                                            )
                                        )}
                                        <TableCell className="hidden sm:table-cell text-center">
                                            <Badge variant="secondary">{d.accounts_count}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => openSettings(d)}>
                                                        <Settings className="mr-2 h-4 w-4" />
                                                        Settings
                                                    </DropdownMenuItem>
                                                    {d.status === "pending" && (
                                                        <DropdownMenuItem onClick={() => handleVerify(d.id)}>
                                                            <RefreshCw className="mr-2 h-4 w-4" />
                                                            Verify DNS
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => setDeleteTarget(d)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Domain
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* ── Add Domain Dialog ── */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Domain</DialogTitle>
                        <DialogDescription>
                            Enter the domain name. DNS records will need to be verified before the domain becomes active.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Domain Name</Label>
                            <Input
                                placeholder="example.com"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Assign to Organization (optional)</Label>
                            <Select value={newDomainOrg} onValueChange={setNewDomainOrg}>
                                <SelectTrigger>
                                    <SelectValue placeholder="None — unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {organizations.map((o) => (
                                        <SelectItem key={o.id} value={o.id}>
                                            {o.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddDomain} disabled={!newDomain.trim()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Domain
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Domain Settings Dialog ── */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Domain Settings — {selectedDomain?.domain_name}</DialogTitle>
                        <DialogDescription>Update the configuration for this domain.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Organization</Label>
                            <Select value={settingsOrg} onValueChange={setSettingsOrg}>
                                <SelectTrigger>
                                    <SelectValue placeholder="None — unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {organizations.map((o) => (
                                        <SelectItem key={o.id} value={o.id}>
                                            {o.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Catch-All Address</Label>
                                <p className="text-xs text-muted-foreground">
                                    Route all unmatched addresses to a default mailbox
                                </p>
                            </div>
                            <Switch checked={settingsCatchAll} onCheckedChange={setSettingsCatchAll} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Auto Sync</Label>
                                <p className="text-xs text-muted-foreground">
                                    Periodically sync accounts on this domain
                                </p>
                            </div>
                            <Switch checked={settingsAutoSync} onCheckedChange={setSettingsAutoSync} />
                        </div>
                        <Separator />
                        <Card className="border-dashed">
                            <CardHeader className="pb-2 pt-3 px-4">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Shield className="h-4 w-4" /> DNS Verification Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-3">
                                <div className="grid grid-cols-5 gap-2">
                                    {selectedDomain &&
                                        (Object.keys(VERIFY_LABELS) as VerifyField[]).map((f) => (
                                            <div key={f} className="flex flex-col items-center gap-1">
                                                <span className="text-[10px] font-medium text-muted-foreground">
                                                    {VERIFY_LABELS[f]}
                                                </span>
                                                <VerifyBadge ok={selectedDomain[f]} />
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveSettings}>Save Settings</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation ── */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete Domain
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{deleteTarget?.domain_name}</strong> and all
                            associated accounts ({deleteTarget?.accounts_count}). This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>
                            Delete Domain
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

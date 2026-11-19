"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
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
    ArrowRightLeft,
} from "lucide-react"
import type { IDomain } from "../_lib/types"
import { API } from "@/lib/api/handler"
import type { IOrganization } from "../_lib/types"
import { EmptyState, OrgPage, PageHeader, Panel, Pill, RowsSkeleton, Section, Stat, StatGrid, type Tone } from "../_components/kit"

type VerifyField = "dns_verified" | "mx_verified" | "spf_verified" | "dkim_verified" | "dmarc_verified"

const VERIFY_LABELS: Record<VerifyField, string> = {
    dns_verified: "DNS",
    mx_verified: "MX",
    spf_verified: "SPF",
    dkim_verified: "DKIM",
    dmarc_verified: "DMARC",
}

const VERIFY_FIELDS = Object.keys(VERIFY_LABELS) as VerifyField[]

const STATUS_TONE: Record<string, Tone> = {
    active: "green",
    pending: "amber",
    inactive: "neutral",
    suspended: "red",
}

function VerifyBadge({ ok }: { ok: boolean }) {
    return ok ? (
        <Pill tone="green">
            <Check className="h-3 w-3" /> Verified
        </Pill>
    ) : (
        <Pill>
            <X className="h-3 w-3" /> Pending
        </Pill>
    )
}

/** DNS / MX / SPF / DKIM / DMARC as five small marks; hover for the name. */
function VerifyMarks({ domain }: { domain: IDomain }) {
    return (
        <div className="flex items-center gap-1.5">
            {VERIFY_FIELDS.map((field) => (
                <span
                    key={field}
                    title={`${VERIFY_LABELS[field]}: ${domain[field] ? "verified" : "pending"}`}
                    className={
                        domain[field]
                            ? "inline-flex items-center gap-0.5 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400"
                            : "inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground/70"
                    }
                >
                    {VERIFY_LABELS[field]}
                </span>
            ))}
        </div>
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

    const assignedCount = React.useMemo(() => domains.filter((d) => !!d.org_id).length, [domains])

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

    return (
        <OrgPage>
            <PageHeader
                title="Domains"
                description="Domains you own, the organization each one belongs to, and whether its DNS records are verified."
                actions={
                    <Button size="sm" onClick={() => setIsAddOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add domain
                    </Button>
                }
            />

            <StatGrid className="mb-6 lg:grid-cols-3">
                <Stat label="Total domains" value={domains.length} icon={Globe} loading={loading} />
                <Stat label="In an organization" value={assignedCount} icon={Building2} loading={loading} />
                <Stat label="Not assigned" value={domains.length - assignedCount} icon={ArrowRightLeft} loading={loading} />
            </StatGrid>

            <Section flush>
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-3">
                    <div className="relative min-w-[200px] max-w-sm flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search domains or organizations"
                            className="h-9 pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="ml-auto text-xs text-muted-foreground">
                        {filtered.length} domain{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {loading ? (
                    <RowsSkeleton rows={4} />
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={Globe}
                        title="No domains found"
                        description={search || statusFilter !== "all" ? "Try adjusting your search or filter." : "Add your first domain to get started."}
                        action={
                            !search && statusFilter === "all" ? (
                                <Button size="sm" onClick={() => setIsAddOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add domain
                                </Button>
                            ) : undefined
                        }
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-5">Domain</TableHead>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden lg:table-cell">Verification</TableHead>
                                    <TableHead className="hidden text-right sm:table-cell">Accounts</TableHead>
                                    <TableHead className="w-12 pr-4 text-right">
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((d) => (
                                    <TableRow key={d.id}>
                                        <TableCell className="pl-5">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                    <Globe className="h-4 w-4" />
                                                </span>
                                                <span className="truncate text-sm font-medium">{d.domain_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {d.org_name ? (
                                                    <Pill tone="blue">
                                                        <Building2 className="h-3 w-3" />
                                                        {d.org_name}
                                                    </Pill>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Not assigned</span>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                                    onClick={() => openSettings(d)}
                                                >
                                                    <ArrowRightLeft className="mr-1 h-3 w-3" />
                                                    {d.org_name ? "Move" : "Assign"}
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Pill tone={STATUS_TONE[d.status] ?? "neutral"} className="capitalize">
                                                {d.status}
                                            </Pill>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            <VerifyMarks domain={d} />
                                        </TableCell>
                                        <TableCell className="hidden text-right text-sm tabular-nums text-muted-foreground sm:table-cell">
                                            {d.accounts_count}
                                        </TableCell>
                                        <TableCell className="pr-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Domain actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => openSettings(d)}>
                                                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                        Move to organization
                                                    </DropdownMenuItem>
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
                                                        Delete domain
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
            </Section>

            {/* ── Add Domain Dialog ── */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add domain</DialogTitle>
                        <DialogDescription>
                            Enter the domain name. DNS records will need to be verified before the domain becomes active.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Domain name</Label>
                            <Input
                                placeholder="example.com"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Assign to organization (optional)</Label>
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
                            <Plus className="mr-2 h-4 w-4" />
                            Add domain
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Domain Settings Dialog ── */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Domain settings — {selectedDomain?.domain_name}</DialogTitle>
                        <DialogDescription>Move this domain to another organization or update its configuration.</DialogDescription>
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
                                <Label>Catch-all address</Label>
                                <p className="text-xs text-muted-foreground">
                                    Route all unmatched addresses to a default mailbox
                                </p>
                            </div>
                            <Switch checked={settingsCatchAll} onCheckedChange={setSettingsCatchAll} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Auto sync</Label>
                                <p className="text-xs text-muted-foreground">
                                    Periodically sync accounts on this domain
                                </p>
                            </div>
                            <Switch checked={settingsAutoSync} onCheckedChange={setSettingsAutoSync} />
                        </div>
                        <Separator />
                        <Panel className="border-dashed px-4 py-3">
                            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                                <Shield className="h-4 w-4 text-muted-foreground" /> DNS verification status
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {selectedDomain &&
                                    VERIFY_FIELDS.map((f) => (
                                        <div key={f} className="flex flex-col items-center gap-1">
                                            <span className="text-[11px] text-muted-foreground">{VERIFY_LABELS[f]}</span>
                                            <VerifyBadge ok={selectedDomain[f]} />
                                        </div>
                                    ))}
                            </div>
                        </Panel>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveSettings}>Save settings</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation ── */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Delete domain
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong className="font-medium text-foreground">{deleteTarget?.domain_name}</strong> and all
                            associated accounts ({deleteTarget?.accounts_count}). This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>
                            Delete domain
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </OrgPage>
    )
}

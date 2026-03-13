"use client"

import { Search, Shield, ShieldOff, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"
import Badge from "@/components/common/badges"
import { useState, useMemo, useCallback } from "react"
import { useAppSelector } from "@/store/hooks"

const SUPER_ADMIN_EMAIL = "mullayam06@gmail.com"

interface Props {
  globalIPs: string[]
  domainIPs: Record<string, string[]>
}

type TabType = "domain" | "global"

export function ManageIP({ globalIPs: initGlobal, domainIPs: initDomain }: Props) {
  const { toast } = useToast()
  const user = useAppSelector(state => state.admin.user)
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL
  const [globalIPs, setGlobalIPs] = useState(initGlobal)
  const [domainIPs, setDomainIPs] = useState(initDomain)
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("domain")
  const [domainFilter, setDomainFilter] = useState("all")

  const domains = useMemo(() => Object.keys(domainIPs), [domainIPs])

  // Flatten domain IPs into a list for table display
  const domainIPList = useMemo(() => {
    const list: { ip: string; domain: string }[] = []
    const entries = domainFilter !== "all"
      ? [[domainFilter, domainIPs[domainFilter] || []]] as [string, string[]][]
      : Object.entries(domainIPs)
    for (const [domain, ips] of entries) {
      for (const ip of ips) list.push({ ip, domain })
    }
    return list.filter(
      (item) => item.ip.includes(query) || item.domain.toLowerCase().includes(query.toLowerCase())
    )
  }, [domainIPs, domainFilter, query])

  const filteredGlobal = useMemo(
    () => globalIPs.filter((ip) => ip.includes(query)),
    [globalIPs, query]
  )

  // ── Actions ──

  const removeGlobalIP = useCallback(async (ip: string) => {
    try {
      const { data } = await API.removeGlobalBlockedIP(ip)
      if (!data.success) throw new Error(data.message)
      setGlobalIPs((prev) => prev.filter((i) => i !== ip))
      toast({ title: data.message })
    } catch {
      toast({ variant: "destructive", title: "Failed to unblock IP" })
    }
  }, [toast])

  const purgeGlobal = useCallback(async () => {
    try {
      const { data } = await API.purgeGlobalBlockedIPs()
      if (!data.success) throw new Error(data.message)
      setGlobalIPs([])
      toast({ title: data.message })
    } catch {
      toast({ variant: "destructive", title: "Failed to purge global IPs" })
    }
  }, [toast])

  const unblockDomainIP = useCallback(async (domain: string, ip: string) => {
    try {
      const { data } = await API.unblockDomainIP(domain, ip)
      if (!data.success) throw new Error(data.message)
      setDomainIPs((prev) => {
        const updated = { ...prev }
        updated[domain] = (updated[domain] || []).filter((i) => i !== ip)
        if (updated[domain].length === 0) delete updated[domain]
        return updated
      })
      toast({ title: data.message })
    } catch {
      toast({ variant: "destructive", title: "Failed to unblock IP" })
    }
  }, [toast])

  const purgeDomain = useCallback(async (domain: string) => {
    try {
      const { data } = await API.purgeDomainBlockedIPs(domain)
      if (!data.success) throw new Error(data.message)
      setDomainIPs((prev) => {
        const updated = { ...prev }
        delete updated[domain]
        return updated
      })
      if (domainFilter === domain) setDomainFilter("all")
      toast({ title: data.message })
    } catch {
      toast({ variant: "destructive", title: "Failed to purge domain IPs" })
    }
  }, [toast, domainFilter])

  const totalCount = activeTab === "global" ? filteredGlobal.length : domainIPList.length
  const purgeLabel = activeTab === "global"
    ? "all global blocked IPs"
    : domainFilter !== "all" ? `all IPs for "${domainFilter}"` : "all domain blocked IPs"

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-semibold text-gray-300">Manage Blocked IPs</h1>
        </div>
        <ConfirmAction
          title={`Purge ${purgeLabel}?`}
          description="This action cannot be undone."
          onConfirm={() => activeTab === "global" ? purgeGlobal() : purgeDomain(domainFilter !== "all" ? domainFilter : "")}
          disabled={totalCount === 0 || (activeTab === "domain" && domainFilter === "all")}
          variant="destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" /> Purge All
        </ConfirmAction>
      </div>

      {/* Tabs + Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-1 border rounded-md p-0.5">
          <Button size="sm" variant={activeTab === "domain" ? "default" : "ghost"} className="rounded-sm" onClick={() => setActiveTab("domain")}>
            Per Domain
          </Button>
          {isSuperAdmin && (
            <Button size="sm" variant={activeTab === "global" ? "default" : "ghost"} className="rounded-sm" onClick={() => setActiveTab("global")}>
              Global
            </Button>
          )}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search by IP..." className="pl-8 bg-background" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {activeTab === "domain" && (
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {domains.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{totalCount} blocked IP{totalCount !== 1 ? "s" : ""}</p>

      {/* Table */}
      <ScrollArea className="h-[400px] w-full rounded-md border">
        {activeTab === "global" ? (
          <IPTable
            items={filteredGlobal.map((ip) => ({ ip }))}
            columns={["IP Address", "Actions"]}
            renderRow={({ ip }) => (
              <TableRow key={ip}>
                <TableCell className="font-mono">{ip}</TableCell>
                <TableCell>
                  <ConfirmAction title="Unblock this IP?" description={<>Remove <b className="font-mono">{ip}</b> from the global block list.</>} onConfirm={() => removeGlobalIP(ip)} variant="warning">
                    <ShieldOff className="h-4 w-4" />
                  </ConfirmAction>
                </TableCell>
              </TableRow>
            )}
          />
        ) : (
          <IPTable
            items={domainIPList}
            columns={["IP Address", "Domain", "Actions"]}
            renderRow={({ ip, domain }) => (
              <TableRow key={`${domain}-${ip}`}>
                <TableCell className="font-mono">{ip}</TableCell>
                <TableCell><Badge text={domain} variant="teal" /></TableCell>
                <TableCell>
                  <ConfirmAction title="Unblock this IP?" description={<>Remove <b className="font-mono">{ip}</b> from <b>{domain}</b>.</>} onConfirm={() => unblockDomainIP(domain, ip)} variant="warning">
                    <ShieldOff className="h-4 w-4" />
                  </ConfirmAction>
                </TableCell>
              </TableRow>
            )}
          />
        )}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

// ── Reusable table with empty state ──

function IPTable<T>({ items, columns, renderRow }: { items: T[]; columns: string[]; renderRow: (item: T) => React.ReactNode }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>{columns.map((c) => <TableHead key={c}>{c}</TableHead>)}</TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-[300px]">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-1">No blocked IPs</h2>
                <p className="text-muted-foreground text-sm">There are no blocked IPs to display.</p>
              </div>
            </TableCell>
          </TableRow>
        ) : items.map(renderRow)}
      </TableBody>
    </Table>
  )
}

// ── Confirm dialog wrapper ──

function ConfirmAction({ children, title, description, onConfirm, disabled, variant }: {
  children: React.ReactNode; title: string; description: React.ReactNode
  onConfirm: () => void; disabled?: boolean; variant: "destructive" | "warning"
}) {
  const btnClass = variant === "destructive"
    ? "bg-red-500 hover:bg-red-600 text-white rounded-none"
    : "bg-orange-500 hover:bg-orange-600 text-white rounded-none"
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant === "destructive" ? "destructive" : "ghost"} size={variant === "destructive" ? "default" : "icon"} className={variant === "destructive" ? "rounded-none" : "h-8 w-8"} disabled={disabled}>
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={btnClass}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

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
import { useToast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"
import { EmptyState, PageHeader, PageShell, Pill, Section, Stat, StatGrid } from "@/components/h-panel/kit"
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
  const domainTotal = useMemo(() => Object.values(domainIPs).reduce((sum, ips) => sum + ips.length, 0), [domainIPs])

  return (
    <PageShell>
      <PageHeader
        title="Blocked IPs"
        description="Addresses that can no longer connect to your mail servers. Unblock one, or purge a whole list."
        actions={
          <ConfirmAction
            title={`Purge ${purgeLabel}?`}
            description="This action cannot be undone."
            onConfirm={() => activeTab === "global" ? purgeGlobal() : purgeDomain(domainFilter !== "all" ? domainFilter : "")}
            disabled={totalCount === 0 || (activeTab === "domain" && domainFilter === "all")}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Purge all
          </ConfirmAction>
        }
      />

      <StatGrid className="mb-6 lg:grid-cols-3">
        <Stat label="Blocked on your domains" value={domainTotal} icon={Shield} />
        <Stat label="Domains with blocked IPs" value={domains.length} />
        {isSuperAdmin && <Stat label="Blocked globally" value={globalIPs.length} />}
      </StatGrid>

      <Section flush>
        {/* Tabs + filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-3">
          <div className="flex gap-0.5 rounded-lg bg-muted/60 p-0.5">
            <Button size="sm" variant={activeTab === "domain" ? "secondary" : "ghost"} className="h-8 px-3 text-xs" onClick={() => setActiveTab("domain")}>
              Per domain
            </Button>
            {isSuperAdmin && (
              <Button size="sm" variant={activeTab === "global" ? "secondary" : "ghost"} className="h-8 px-3 text-xs" onClick={() => setActiveTab("global")}>
                Global
              </Button>
            )}
          </div>
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search by IP" className="h-9 pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {activeTab === "domain" && (
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue placeholder="Filter by domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All domains</SelectItem>
                {domains.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <span className="ml-auto text-xs text-muted-foreground">{totalCount} blocked IP{totalCount !== 1 ? "s" : ""}</span>
        </div>

        {activeTab === "global" ? (
          <IPTable
            items={filteredGlobal.map((ip) => ({ ip }))}
            columns={["IP address", "Actions"]}
            renderRow={({ ip }) => (
              <TableRow key={ip}>
                <TableCell className="pl-5 font-mono text-sm">{ip}</TableCell>
                <TableCell className="pr-4 text-right">
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
            columns={["IP address", "Domain", "Actions"]}
            renderRow={({ ip, domain }) => (
              <TableRow key={`${domain}-${ip}`}>
                <TableCell className="pl-5 font-mono text-sm">{ip}</TableCell>
                <TableCell><Pill tone="blue">{domain}</Pill></TableCell>
                <TableCell className="pr-4 text-right">
                  <ConfirmAction title="Unblock this IP?" description={<>Remove <b className="font-mono">{ip}</b> from <b>{domain}</b>.</>} onConfirm={() => unblockDomainIP(domain, ip)} variant="warning">
                    <ShieldOff className="h-4 w-4" />
                  </ConfirmAction>
                </TableCell>
              </TableRow>
            )}
          />
        )}
      </Section>
    </PageShell>
  )
}

// ── Reusable table with empty state ──

function IPTable<T>({ items, columns, renderRow }: { items: T[]; columns: string[]; renderRow: (item: T) => React.ReactNode }) {
  if (items.length === 0) {
    return <EmptyState icon={Shield} title="No blocked IPs" description="There are no blocked IPs to display." />
  }
  return (
    <div className="max-h-[calc(100vh-24rem)] min-h-[200px] overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow className="hover:bg-transparent">
            {columns.map((c, index) => (
              <TableHead key={c} className={index === 0 ? "pl-5" : index === columns.length - 1 ? "pr-4 text-right" : undefined}>{c}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{items.map(renderRow)}</TableBody>
      </Table>
    </div>
  )
}

// ── Confirm dialog wrapper ──

function ConfirmAction({ children, title, description, onConfirm, disabled, variant }: {
  children: React.ReactNode; title: string; description: React.ReactNode
  onConfirm: () => void; disabled?: boolean; variant: "destructive" | "warning"
}) {
  const btnClass = variant === "destructive"
    ? "bg-red-600 hover:bg-red-700 text-white"
    : "bg-amber-600 hover:bg-amber-700 text-white"
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant === "destructive" ? "outline" : "ghost"} size={variant === "destructive" ? "sm" : "icon"} className={variant === "destructive" ? "text-red-600 hover:text-red-600" : "h-8 w-8 text-muted-foreground hover:text-foreground"} disabled={disabled} title={variant === "warning" ? "Unblock" : undefined}>
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={btnClass}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

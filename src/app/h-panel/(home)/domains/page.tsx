"use client";
import { Globe, MoreHorizontal, Plus, ScrollText, Search, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import React from "react";
import { API } from "@/lib/api/handler";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DOMAIN_STATUS } from "@/lib/types/mail.interface";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { setMyDomains } from "@/store/slices/account";
import { dnsRecordsValue } from "@/lib/utils";
import CopyToClipboard from "@/components/common/copyToClipboard";
import { EmptyState, PageHeader, PageShell, Pill, RowsSkeleton, Section, Stat, StatGrid } from "@/components/h-panel/kit";
import { DomainStatusPill } from "./_components/domain-status";

export default function DomainDashboard() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [domains, setDomains] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedDomain, setSelectedDomain] = React.useState<Record<string, any> | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<any | null>(null)

  const fetchAllDomains = React.useCallback(async () => {
    try {

      const { data } = await API.handleGetAllDomains();
      if (!data.success) {
        throw new Error(data.message);
      }

      setDomains(data.result);
      setIsLoading(false);

      dispatch(
        setMyDomains(
          data.result
            .filter((domain: any) => domain.status === DOMAIN_STATUS.VERIFIED)
            .map((domain: any) => domain.domain_name)
        )
      );
    } catch (error) {
      setIsLoading(false);
    }
  }, [dispatch]);
  const handleDeleteDomain = React.useCallback(async (id: string) => {
    try {
      const { data } = await API.deleteDomain(id);
      if (!data.success) {
        throw new Error(data.message);
      }
      setDomains((prev) => prev.filter((domain) => domain.id !== id));
      toast({ title: data.message });
      setSelectedDomain(null)

    } catch (error) {
      setIsLoading(false);

      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again later.",
      });
    }
  }, [toast]);

  const handleClaimDomainOwnership = React.useCallback(async (id: string) => {
    try {
      const { data } = await API.claimDomainOwnership(id);
      if (!data.success) {
        throw new Error(data.message);
      }
      toast({ title: data.message });
      setSelectedDomain(null)
      setDomains((prevDomains) =>
        prevDomains.map((domain) =>
          domain.id.trim() === id.trim()
            ? { ...domain, status: DOMAIN_STATUS.PENDING }
            : domain
        )
      );

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: error.message,
        description: "Something went wrong. Please try again later.",
      });
    }
  }, [toast])
  const handleVerifyDomain = React.useCallback(async (id: string) => {
    try {
      const { data } = await API.verifyDomainOwnership(id);
      if (!data.success) {
        throw new Error(data.message);
      }
      toast({ title: data.message });
      setSelectedDomain(data.result)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again later.",
      });
    }
  }, [toast])
  React.useEffect(() => {
    fetchAllDomains();
  }, [fetchAllDomains]);
  const filteredDomains = React.useMemo(() => {
    return domains.filter((domain) => {
      const matchesQuery = domain.domain_name.toLowerCase().includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || String(domain.status).toLowerCase() === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, domains]);

  const counts = React.useMemo(
    () => ({
      verified: domains.filter((d) => d.status === DOMAIN_STATUS.VERIFIED).length,
      pending: domains.filter((d) => d.status === DOMAIN_STATUS.PENDING).length,
      notStarted: domains.filter((d) => d.status === DOMAIN_STATUS.NOT_STARTED).length,
    }),
    [domains]
  );

  return (
    <PageShell>
      <PageHeader
        title="Domains"
        description="The domains you send and receive mail on. Verify ownership, then add DNS records to start sending."
        actions={
          <Button asChild size="sm">
            <Link href="/h-panel/domains/create">
              <Plus className="mr-2 h-4 w-4" />
              Add domain
            </Link>
          </Button>
        }
      />

      <StatGrid className="mb-6">
        <Stat label="Total domains" value={domains.length} icon={Globe} loading={isLoading} />
        <Stat label="Verified" value={counts.verified} icon={ShieldCheck} loading={isLoading} />
        <Stat label="Pending" value={counts.pending} loading={isLoading} />
        <Stat label="Not started" value={counts.notStarted} loading={isLoading} />
      </StatGrid>

      <Section flush>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-3">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search domains"
              className="h-9 pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="not started">Not started</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-auto text-xs text-muted-foreground">
            {filteredDomains.length} domain{filteredDomains.length !== 1 ? "s" : ""}
          </span>
        </div>

        {isLoading ? (
          <RowsSkeleton rows={4} />
        ) : filteredDomains.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No domains found"
            description={
              query.length > 0 || statusFilter !== "all"
                ? "Try a different search or filter, or contact support."
                : "Add your first domain to get started."
            }
            action={
              query.length === 0 && statusFilter === "all" ? (
                <Button asChild size="sm">
                  <Link href="/h-panel/domains/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Add domain
                  </Link>
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
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="pr-4 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDomains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Globe className="h-4 w-4" />
                        </span>
                        {domain.status === DOMAIN_STATUS.NOT_STARTED ? (
                          <span className="truncate text-sm font-medium">{domain.domain_name}</span>
                        ) : (
                          <Link
                            href={`domains/${domain.id}`}
                            className="truncate text-sm font-medium hover:underline"
                          >
                            {domain.domain_name}
                          </Link>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DomainStatusPill status={domain.status} />
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {format(new Date(domain.created_at), "PPP")}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center justify-end gap-1">
                        {domain.status === DOMAIN_STATUS.NOT_STARTED && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            title="Verify"
                            onClick={() => handleVerifyDomain(domain.id)}
                          >
                            Verify domain
                          </Button>
                        )}
                        {domain.status === DOMAIN_STATUS.VERIFIED && (
                          <Button asChild variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground">
                            <Link title="Logs" href={`/h-panel/domains/${domain.id}/logs`}>
                              <ScrollText className="mr-1.5 h-4 w-4" />
                              Logs
                            </Link>
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="More">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {domain.status !== DOMAIN_STATUS.NOT_STARTED && (
                              <DropdownMenuItem asChild>
                                <Link href={`domains/${domain.id}`}>Open domain</Link>
                              </DropdownMenuItem>
                            )}
                            {domain.status === DOMAIN_STATUS.VERIFIED && (
                              <DropdownMenuItem asChild>
                                <Link href={`/h-panel/domains/${domain.id}/logs`}>View logs</Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onSelect={() => setDeleteTarget(domain)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>

      {selectedDomain && (
        <ShowVerifyDomain data={selectedDomain} handleClaimDomainOwnership={handleClaimDomainOwnership} />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete {deleteTarget?.domain_name ? <span className="font-medium text-foreground">{deleteTarget.domain_name}</span> : "the domain"}.
              Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) handleDeleteDomain(deleteTarget.id)
                setDeleteTarget(null)
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
function ShowVerifyDomain({ data, handleClaimDomainOwnership }: { data: any, handleClaimDomainOwnership: (data: any) => void }) {

  return (
    <Section
      className="mt-6"
      title="Verify domain"
      description="Prove you own this domain by publishing one TXT record, then confirm."
      actions={
        <Button size="sm" onClick={() => handleClaimDomainOwnership(data.id)}>
          Verify domain
        </Button>
      }
      flush
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Server / Content / Target</TableHead>
              <TableHead className="pr-5">TTL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="pl-5">
                <Pill>{dnsRecordsValue[data.records?.type]}</Pill>
              </TableCell>
              <TableCell className="font-mono text-sm">{data.records?.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <code className="break-all font-mono text-sm">{data.records?.data}</code>
                  <CopyToClipboard text={String(data.records?.data ?? "")} />
                </div>
              </TableCell>
              <TableCell className="pr-5 text-sm text-muted-foreground">{data.records?.TTL}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <p className="border-t border-border/70 px-5 py-3 text-sm text-muted-foreground">
        Create a TXT record for <span className="font-mono text-foreground">{data.records?.name}</span> with the value{" "}
        <span className="break-all font-mono text-foreground">{data.records?.data}</span>
      </p>
    </Section>
  )
}

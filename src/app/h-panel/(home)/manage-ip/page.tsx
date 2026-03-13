"use client";
import { Loader2, Search, Shield, ShieldOff, Trash2 } from "lucide-react";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import Badge from "@/components/common/badges";

interface BlockedIP {
  id: string;
  ip: string;
  domain: string;
  reason: string;
  blocked_at: string;
}

export default function ManageIPPage() {
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [domainFilter, setDomainFilter] = React.useState("all");
  const [blockedIPs, setBlockedIPs] = React.useState<BlockedIP[]>([]);
  const [domains, setDomains] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPurging, setIsPurging] = React.useState(false);

  const fetchBlockedIPs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const domainQuery = domainFilter !== "all" ? `?domain=${domainFilter}` : "";
      const { data } = await API.getBlockedIPs(domainQuery);
      if (!data.success) {
        throw new Error(data.message);
      }
      setBlockedIPs(data.result || []);
      const uniqueDomains = [...new Set((data.result || []).map((ip: BlockedIP) => ip.domain))];
      setDomains(uniqueDomains as string[]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch blocked IPs.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [domainFilter, toast]);

  const handleUnblockIP = React.useCallback(
    async (id: string) => {
      try {
        const { data } = await API.unblockIP(id);
        if (!data.success) {
          throw new Error(data.message);
        }
        setBlockedIPs((prev) => prev.filter((ip) => ip.id !== id));
        toast({ title: data.message || "IP unblocked successfully" });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to unblock IP. Please try again.",
        });
      }
    },
    [toast]
  );

  const handlePurgeAll = React.useCallback(async () => {
    try {
      setIsPurging(true);
      const domainQuery = domainFilter !== "all" ? `?domain=${domainFilter}` : "";
      const { data } = await API.purgeAllBlockedIPs(domainQuery);
      if (!data.success) {
        throw new Error(data.message);
      }
      setBlockedIPs([]);
      toast({ title: data.message || "All blocked IPs purged successfully" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to purge blocked IPs. Please try again.",
      });
    } finally {
      setIsPurging(false);
    }
  }, [domainFilter, toast]);

  React.useEffect(() => {
    fetchBlockedIPs();
  }, [fetchBlockedIPs]);

  const filteredIPs = React.useMemo(() => {
    return blockedIPs.filter((ip) => {
      const matchesQuery =
        ip.ip.toLowerCase().includes(query.toLowerCase()) ||
        ip.domain.toLowerCase().includes(query.toLowerCase()) ||
        ip.reason.toLowerCase().includes(query.toLowerCase());
      return matchesQuery;
    });
  }, [query, blockedIPs]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500" />
            <h1 className="text-2xl font-semibold text-gray-300">
              Manage Blocked IPs
            </h1>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="rounded-none"
                disabled={blockedIPs.length === 0 || isPurging}
              >
                {isPurging ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Purge All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Purge all blocked IPs?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will unblock all {domainFilter !== "all" ? `IPs for domain "${domainFilter}"` : "blocked IPs"}.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-none">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handlePurgeAll}
                  className="bg-red-500 text-primary-foreground hover:bg-red-600 rounded-none"
                >
                  Purge All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by IP, domain, or reason..."
              className="pl-8 bg-background"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:w-auto w-full">
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredIPs.length} blocked IP{filteredIPs.length !== 1 ? "s" : ""} found
        </div>

        <ScrollArea className="h-[400px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP Address</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Blocked At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-[300px]">
                    <div className="flex items-center justify-center h-full">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Loader2 className="w-12 h-12 text-primary" />
                      </motion.div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredIPs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-[300px]">
                    <div className="rounded-lg h-full flex flex-col items-center justify-center p-6 text-center">
                      <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                      <h2 className="text-xl font-semibold mb-2">
                        No blocked IPs
                      </h2>
                      <p className="text-gray-500 mb-4">
                        {query.length > 0
                          ? "No IPs match your search criteria."
                          : "There are no blocked IPs at this time."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredIPs.map((ip) => (
                  <TableRow key={ip.id}>
                    <TableCell className="font-mono font-medium">
                      {ip.ip}
                    </TableCell>
                    <TableCell>
                      <Badge text={ip.domain} variant="teal" />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {ip.reason}
                    </TableCell>
                    <TableCell>
                      {format(new Date(ip.blocked_at), "PPP p")}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Unblock IP"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <ShieldOff className="h-4 w-4" color="orange" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Unblock this IP?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will unblock <span className="font-mono font-bold">{ip.ip}</span> for
                              domain <span className="font-bold">{ip.domain}</span>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-none">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleUnblockIP(ip.id)}
                              className="bg-orange-500 text-primary-foreground hover:bg-orange-600 rounded-none"
                            >
                              Unblock
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}

"use client";
import { Loader2, Search, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog"
import { motion } from "framer-motion";
import Badge from "@/components/common/badges";
import { DOMAIN_STATUS } from "@/lib/types/mail.interface";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { setMyDomains } from "@/store/slices/account";
import { dnsRecordsValue } from "@/lib/utils";
export default function DomainDashboard() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [query, setQuery] = React.useState("");
  const [domains, setDomains] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedDomain, setSelectedDomain] = React.useState<Record<string, any> | null>(null)

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
          data.result.map(
            (domain: any) =>
              domain.status === DOMAIN_STATUS.VERIFIED && domain.domain_name
          )
        )
      );
    } catch (error) {
      setIsLoading(false);
    }
  }, []);
  const handleDeleteDomain = React.useCallback(async (id: string) => {
    try {
      const { data } = await API.deleteDomain(id);
      if (!data.success) {
        throw new Error(data.message);
      }
      const UpdatedDomains = domains.map((domain) => {
        if (domain.id !== id) {
          
          return domain;
        }
      })
      console.log(UpdatedDomains)
      setDomains(UpdatedDomains);
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
  }, []);

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
  }, [])
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
  }, [])
  React.useEffect(() => {
    fetchAllDomains();
  }, []);
  const filteredDomains = React.useMemo(() => {
    return domains.filter((domain) => {
      return domain.domain_name.toLowerCase().includes(query.toLowerCase());
    });
  }, [query, domains]);
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-300">My Domains</h1>
          <Link href="/h-panel/domains/create" className="btn btn-primary"> <Button className="rounded-none">Add New Domain</Button></Link>

        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 bg-background"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:w-auto w-full">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <ScrollArea className="h-[300px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>More</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-[240px]">
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
              ) : filteredDomains.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-[240px]">
                    <div className="  rounded-lg h-full flex flex-col items-center justify-center p-6 text-center">
                      <h2 className="text-xl font-semibold mb-2">
                        No results found
                      </h2>
                      {query.length > 0 ? (
                        <p className="text-gray-500 mb-4">
                          <p className="text-muted-foreground">
                            Try searching or filtering for a different term or
                            contact support.
                          </p>
                        </p>
                      ) : (
                        <p className="text-gray-500 mb-4">
                          Add your first domain
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDomains.map((domain) => (
                  <TableRow key={domain.id}>
                    {domain.status === DOMAIN_STATUS.NOT_STARTED ? (
                      <TableCell className="font-medium underline">
                        {domain.domain_name}
                      </TableCell>
                    ) : (
                      <TableCell className="font-medium underline text-blue-500">
                        {" "}
                        <Link href={`domains/${domain.id}`}>
                          {domain.domain_name}
                        </Link>
                      </TableCell>
                    )}

                    <TableCell>
                      <Badge
                        text={domain.status}
                        variant={
                          domain.status === DOMAIN_STATUS.VERIFIED
                            ? "teal"
                            : domain.status === DOMAIN_STATUS.PENDING
                              ? "yellow"
                              : "red"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(domain.created_at), "PPP")}
                    </TableCell>
                    <TableCell className="font-medium underline text-blue-500 flex items-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button

                            variant="ghost"
                            size="icon"
                            title="Delete"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Trash2 className="h-4 w-4" color="red" />
                          </Button>

                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will delete the domain.
                              Do you want to continue?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDomain(domain.id)}
                              className="bg-red-500 text-primary-foreground hover:bg-primary/90 rounded-none"

                            >
                              Continue
                            </AlertDialogAction>

                          </AlertDialogFooter>
                        </AlertDialogContent>

                      </AlertDialog>

                      {domain.status === DOMAIN_STATUS.NOT_STARTED && (
                        <div className="font-medium underline text-blue-500 cursor-pointer">
                          <span title="Verify" onClick={() => handleVerifyDomain(domain.id)}>Verify Domain</span>
                        </div>
                      )}
                      {domain.status === DOMAIN_STATUS.VERIFIED && <div className="font-medium underline text-blue-500">
                        <Link title="Logs" href={`/h-panel/domains/${domain.id}/logs`}>
                          see logs
                        </Link>
                      </div>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {selectedDomain && <ShowVerifyDomain data={selectedDomain} handleClaimDomainOwnership={handleClaimDomainOwnership} />}
      </div>
    </div>
  );
}
function ShowVerifyDomain({ data, handleClaimDomainOwnership }: { data: any, handleClaimDomainOwnership: (data: any) => void }) {

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center gap-2 justify-between">
        <span><h3 className="text-lg font-semibold">Verify Domain</h3></span>
        <Button variant="outline" className="bg-orange-400" onClick={() => handleClaimDomainOwnership(data.id)} >  Verify Domain</Button>

      </div>
      <div className="rounded-lg border">

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Server / Content / Target</TableHead>
              <TableHead>TTL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>{dnsRecordsValue[data.records?.type]}</TableCell>
              <TableCell>{data.records?.name}</TableCell>
              <TableCell className="font-mono">{data.records?.data}</TableCell>
              <TableCell>{data.records?.TTL}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <p> Create a TXT record for <span className="font-semibold underline text-yellow-200">{data.records?.name}</span> with the value <span className="font-semibold underline text-orange-300">{data.records?.data}</span></p>
    </div>

  )
}

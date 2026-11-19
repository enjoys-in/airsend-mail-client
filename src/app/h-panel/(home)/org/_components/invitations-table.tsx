"use client"

import * as React from "react"
import {
    Copy,
    Check,
    RotateCw,
    Trash2,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Mail,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState, Initials, Pill } from "./kit"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
import { useToast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"
import type { IInvitation } from "../_lib/types"

interface InvitationsTableProps {
    data: IInvitation[]
    onUpdated?: () => void
}

export function InvitationsTable({ data, onUpdated }: InvitationsTableProps) {
    const { toast } = useToast()
    const [invitations, setInvitations] = React.useState<IInvitation[]>(data)
    const [copiedId, setCopiedId] = React.useState<string | null>(null)
    const [resendingId, setResendingId] = React.useState<string | null>(null)
    const [revokeTarget, setRevokeTarget] = React.useState<IInvitation | null>(null)
    const [revoking, setRevoking] = React.useState(false)

    React.useEffect(() => {
        setInvitations(data)
    }, [data])

    const copyInviteLink = (inv: IInvitation) => {
        const url = inv.accept_url || `${window.location.origin}/invite/accept?token=${inv.id}`
        navigator.clipboard.writeText(url)
        setCopiedId(inv.id)
        toast({
            title: "Link copied",
            description: "Invitation link has been copied to your clipboard.",
        })
        setTimeout(() => setCopiedId(null), 2500)
    }

    const handleResend = async (inv: IInvitation) => {
        setResendingId(inv.id)
        try {
            const { data: res } = await API.resendInvitation(inv.id)
            if (res?.success) {
                toast({
                    title: "Invitation resent",
                    description: `A fresh invitation email has been sent to ${inv.email}.`,
                })
                onUpdated?.()
            } else {
                throw new Error(res?.message || "Failed to resend invitation")
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Could not resend invitation",
                variant: "destructive",
            })
        } finally {
            setResendingId(null)
        }
    }

    const confirmRevoke = async () => {
        if (!revokeTarget) return
        setRevoking(true)
        try {
            const { data: res } = await API.revokeInvitation(revokeTarget.id)
            if (res?.success) {
                toast({
                    title: "Invitation revoked",
                    description: `Invitation for ${revokeTarget.email} was cancelled.`,
                })
                setInvitations((prev) => prev.filter((i) => i.id !== revokeTarget.id))
                onUpdated?.()
            } else {
                throw new Error(res?.message || "Failed to revoke invitation")
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Could not revoke invitation",
                variant: "destructive",
            })
        } finally {
            setRevoking(false)
            setRevokeTarget(null)
        }
    }

    const getStatusBadge = (status: string, expiresAt: string) => {
        const isExpired = new Date(expiresAt) < new Date() && status === "pending"
        const displayStatus = isExpired ? "expired" : status

        switch (displayStatus) {
            case "pending":
                return (
                    <Pill tone="amber">
                        <Clock className="h-3 w-3" /> Pending
                    </Pill>
                )
            case "accepted":
                return (
                    <Pill tone="green">
                        <CheckCircle2 className="h-3 w-3" /> Accepted
                    </Pill>
                )
            case "expired":
                return (
                    <Pill>
                        <AlertCircle className="h-3 w-3" /> Expired
                    </Pill>
                )
            case "revoked":
                return (
                    <Pill tone="red">
                        <XCircle className="h-3 w-3" /> Revoked
                    </Pill>
                )
            default:
                return <Pill>{status}</Pill>
        }
    }

    if (!invitations || invitations.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-border/70">
                <EmptyState
                    icon={Mail}
                    title="No invitations"
                    description="When you invite external members to your organization, their invite status and setup links appear here."
                />
            </div>
        )
    }

    return (
        <>
            <div className="overflow-hidden rounded-lg border border-border/70">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="h-10 text-xs text-muted-foreground">Invited</TableHead>
                            <TableHead className="h-10 text-xs text-muted-foreground">Organization</TableHead>
                            <TableHead className="h-10 text-xs text-muted-foreground">Role</TableHead>
                            <TableHead className="hidden h-10 text-xs text-muted-foreground xl:table-cell">Scopes</TableHead>
                            <TableHead className="h-10 text-xs text-muted-foreground">Status</TableHead>
                            <TableHead className="h-10 text-xs text-muted-foreground">Sent</TableHead>
                            <TableHead className="h-10 text-right text-xs text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invitations.map((inv) => (
                            <TableRow key={inv.id} className="hover:bg-muted/30">
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-3">
                                        <Initials text={inv.name || inv.email} />
                                        <div className="min-w-0">
                                            <div className="truncate text-sm">{inv.name || inv.email}</div>
                                            <div className="truncate text-xs text-muted-foreground">{inv.email}</div>
                                            {inv.accepted_email && (
                                                <div className="truncate text-[11px] text-emerald-700 dark:text-emerald-400">
                                                    Created: {inv.accepted_email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3">
                                    <div className="text-sm">{inv.org_name || "—"}</div>
                                    <div className="text-xs text-muted-foreground">{inv.domain_name}</div>
                                </TableCell>
                                <TableCell className="py-3">
                                    <Pill className="capitalize">{inv.role}</Pill>
                                </TableCell>
                                <TableCell className="hidden py-3 xl:table-cell">
                                    <div className="flex max-w-[200px] flex-wrap gap-1">
                                        {(inv.scopes || []).map((s) => (
                                            <Pill key={s}>{s}</Pill>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="py-3">{getStatusBadge(inv.status, inv.expires_at)}</TableCell>
                                <TableCell className="whitespace-nowrap py-3 text-xs text-muted-foreground">
                                    {new Date(inv.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {inv.status === "pending" && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    title="Copy invite link"
                                                    onClick={() => copyInviteLink(inv)}
                                                >
                                                    {copiedId === inv.id ? (
                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    title="Resend invite email"
                                                    disabled={resendingId === inv.id}
                                                    onClick={() => handleResend(inv)}
                                                >
                                                    <RotateCw
                                                        className={`h-4 w-4 ${
                                                            resendingId === inv.id ? "animate-spin" : ""
                                                        }`}
                                                    />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                                                    title="Revoke invitation"
                                                    onClick={() => setRevokeTarget(inv)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                        {inv.status !== "pending" && (
                                            <span className="text-xs text-muted-foreground capitalize">
                                                {inv.status}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Revoke confirmation */}
            <AlertDialog
                open={!!revokeTarget}
                onOpenChange={(open) => !open && setRevokeTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel the invitation sent to{" "}
                            <span className="text-foreground">{revokeTarget?.email}</span>? The invitation link will no
                            longer be valid.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={revoking}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmRevoke}
                            disabled={revoking}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {revoking ? "Revoking..." : "Revoke invitation"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

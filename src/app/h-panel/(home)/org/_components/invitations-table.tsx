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
    Send,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
                    <Badge variant="outline" className="gap-1 border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400">
                        <Clock className="w-3 h-3" /> Pending
                    </Badge>
                )
            case "accepted":
                return (
                    <Badge variant="outline" className="gap-1 border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Accepted
                    </Badge>
                )
            case "expired":
                return (
                    <Badge variant="outline" className="gap-1 border-neutral-300 text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400">
                        <AlertCircle className="w-3 h-3" /> Expired
                    </Badge>
                )
            case "revoked":
                return (
                    <Badge variant="outline" className="gap-1 border-rose-300 text-rose-700 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400">
                        <XCircle className="w-3 h-3" /> Revoked
                    </Badge>
                )
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    if (!invitations || invitations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-lg">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                    <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold">No pending invitations</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    When you invite external members to your organization, their invite status and setup links will appear here.
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invited User</TableHead>
                            <TableHead>Organization & Domain</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Scopes</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sent</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invitations.map((inv) => (
                            <TableRow key={inv.id}>
                                <TableCell>
                                    <div className="font-medium text-sm text-foreground">
                                        {inv.name || inv.email}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        {inv.email}
                                    </div>
                                    {inv.accepted_email && (
                                        <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                                            Created: {inv.accepted_email}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm font-medium">{inv.org_name || "—"}</div>
                                    <div className="text-xs text-muted-foreground">{inv.domain_name}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="capitalize text-xs font-medium">
                                        {inv.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                        {(inv.scopes || []).map((s) => {
                                            const [feat, perm] = s.split(":")
                                            return (
                                                <span
                                                    key={s}
                                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                                                >
                                                    {feat}:{perm}
                                                </span>
                                            )
                                        })}
                                    </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(inv.status, inv.expires_at)}</TableCell>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                    {new Date(inv.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {inv.status === "pending" && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    title="Copy Invite Link"
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
                                                    title="Resend Invite Email"
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
                                                    title="Revoke Invitation"
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
                        <AlertDialogTitle>Revoke Invitation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel the invitation sent to{" "}
                            <strong>{revokeTarget?.email}</strong>? The invitation link will no
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
                            {revoking ? "Revoking..." : "Revoke Invitation"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

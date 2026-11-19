"use client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { HardDrive, Info, KeyRound, MoreHorizontal, Plus, Search, Trash2, UserCheck, Users } from 'lucide-react'
import { useState, useMemo, useCallback } from "react"
import { API } from "@/lib/api/handler"
import { formatBytes } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { MailServerDetails } from "./mailServerDetails"
import { ResetPasswordForm } from "./resetPassword"
import { FetchAllUsersRootObject } from "./types"
import { EmptyState, Initials, PageHeader, PageShell, Pill, Section, Stat, StatGrid, type Tone } from "@/components/h-panel/kit"

const statusTone = (status: string): Tone => {
    const value = String(status ?? "").toLowerCase()
    if (value === "active") return "green"
    if (value === "banned" || value === "deleted") return "red"
    if (value === "inactive" || value === "suspended" || value === "pending") return "amber"
    return "neutral"
}

const quotaLabel = (quota: string) => (+quota > 0 ? formatBytes(+quota) : "Unlimited")

export function UserManagement({ users }: { users: FetchAllUsersRootObject[] }) {
    const { toast } = useToast()
    const router = useRouter()

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedAccount, setSelectedAccount] = useState<{ email: string, password: string } | null>(null)
    const [isResetPasswordDialodOpen, setIsResetPasswordDialogOpen] = useState(false)
    const [isUserDeleteDialodOpen, setIsUserDeleteDialodOpen] = useState(false)
    const [showServerDetails, setShowServerDetails] = useState(false)

    const handleDeleteUser = useCallback(async () => {
        try {
            if (!selectedAccount) {
                return
            }
            const { data } = await API.handleDeleteUser(selectedAccount.email)
            if (!data.success) {
                throw new Error(data.message)
            }
            toast({ title: data.message })
            router.refresh()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }, [selectedAccount, toast, router])

    // Memoize filtered users to avoid recalculation on every render
    const filteredUsers = useMemo(() => {
        return users.filter(u =>
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [users, searchQuery])

    const stats = useMemo(() => {
        const active = users.filter((u) => String(u.status).toLowerCase() === "active").length
        const usage = users.reduce((sum, u) => sum + (+u.usage || 0), 0)
        return { total: users.length, active, usage }
    }, [users])

    const handleShowDetails = useCallback((user: FetchAllUsersRootObject) => {
        setShowServerDetails(true)
        setSelectedAccount((prev) =>
            prev && prev.email === user.email
                ? null
                : { email: user.email, password: "yourpassword", enable_imap: user.settings.imap_config.enable_imap, enable_smtp: user.settings.smtp_config.enable_smtp }
        )
    }, [])

    const handleResetPassword = useCallback((user: FetchAllUsersRootObject) => {
        setSelectedAccount({ email: user.email, password: "yourpassword" })
        setIsResetPasswordDialogOpen(true)
    }, [])

    const handleDeleteClick = useCallback((user: FetchAllUsersRootObject) => {
        setSelectedAccount({ email: user.email, password: "yourpassword" })
        setIsUserDeleteDialodOpen(true)
    }, [])

    return (
        <PageShell>
            <PageHeader
                title="Users"
                description="Mailboxes on your domains. Open a mailbox to see its server settings, reset its password or remove it."
                actions={
                    <Button asChild size="sm" className="gap-1.5">
                        <Link href="/h-panel/accounts/create">
                            <Plus className="h-4 w-4" />
                            Add user
                        </Link>
                    </Button>
                }
            />

            <div className="space-y-5">
                <StatGrid className="lg:grid-cols-3">
                    <Stat label="Users" value={stats.total} icon={Users} />
                    <Stat label="Active" value={stats.active} icon={UserCheck} />
                    <Stat label="Storage used" value={formatBytes(stats.usage)} icon={HardDrive} />
                </StatGrid>

                <Section
                    flush
                    title="All users"
                    description={`${filteredUsers.length} of ${users.length} shown`}
                    actions={
                        <div className="relative w-56 sm:w-72">
                            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by email"
                                className="h-9 pl-8 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    }
                >
                    {filteredUsers.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title={users.length === 0 ? "No users yet" : "No users match your search"}
                            description={users.length === 0 ? "Create the first mailbox on one of your domains." : "Try a different name or address."}
                            action={
                                users.length === 0 ? (
                                    <Button asChild size="sm" className="gap-1.5">
                                        <Link href="/h-panel/accounts/create">
                                            <Plus className="h-4 w-4" />
                                            Add user
                                        </Link>
                                    </Button>
                                ) : undefined
                            }
                        />
                    ) : (
                        <div className="max-h-[560px] overflow-auto">
                            <Table>
                                <TableHeader className="sticky top-0 z-10 bg-card">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-5">User</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead>Quota</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12 pr-5 text-right">
                                            <span className="sr-only">Actions</span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user, i) => (
                                        <TableRow key={user.email + i}>
                                            <TableCell className="pl-5">
                                                <div className="flex items-center gap-3">
                                                    <Initials text={user.name || user.email} />
                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-medium">{user.name || user.email.split("@")[0]}</div>
                                                        <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatBytes(+user.usage)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{quotaLabel(user.mailbox_size)}</TableCell>
                                            <TableCell>
                                                <Pill tone={statusTone(user.status)}>{String(user.status ?? "").toLowerCase()}</Pill>
                                            </TableCell>
                                            <TableCell className="pr-5 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Actions for {user.email}</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleShowDetails(user)}>
                                                            <Info className="mr-2 h-4 w-4" />
                                                            Server settings
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                                            <KeyRound className="mr-2 h-4 w-4" />
                                                            Reset password
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteClick(user)}
                                                            className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
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

                {showServerDetails && selectedAccount && (
                    <MailServerDetails selectedAccount={selectedAccount as any} />
                )}
            </div>

            {selectedAccount && (
                <Dialog open={isResetPasswordDialodOpen} onOpenChange={setIsResetPasswordDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Reset password</DialogTitle>
                            <DialogDescription>
                                This replaces the password of {selectedAccount.email}. Do you want to continue?
                            </DialogDescription>
                        </DialogHeader>
                        <ResetPasswordForm email={selectedAccount?.email} />
                    </DialogContent>
                </Dialog>
            )}

            <AlertDialog open={isUserDeleteDialodOpen} onOpenChange={setIsUserDeleteDialodOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this user?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This cannot be undone. {selectedAccount?.email ?? "The mailbox"} and its data will be permanently removed from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Delete user
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageShell>
    )
}

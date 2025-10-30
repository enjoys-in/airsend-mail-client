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
import { useToast } from "@/components/ui/use-toast"
import { Info, Trash2 } from 'lucide-react'
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
import { RiLockPasswordLine } from "@remixicon/react"

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

    const handleShowDetails = useCallback((user: FetchAllUsersRootObject) => {
        setShowServerDetails(true)
        setSelectedAccount((prev) =>
            prev && prev.email === user.email
                ? null
                : { email: user.email, password: "yourpassword", enable_imap: user.settings.imap_config.enable_imap, enable_smtp: user.settings.smtp_config.enable_smtp }
        )
    }, [showServerDetails])

    const handleResetPassword = useCallback((user: FetchAllUsersRootObject) => {
        setSelectedAccount({ email: user.email, password: "yourpassword" })
        setIsResetPasswordDialogOpen(true)
    }, [])

    const handleDeleteClick = useCallback((user: FetchAllUsersRootObject) => {
        setSelectedAccount({ email: user.email, password: "yourpassword" })
        setIsUserDeleteDialodOpen(true)
    }, [])

    return (
        <div className="container mx-auto p-4 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-200">Users</h1>
                <Link href="/h-panel/accounts/create" className="btn btn-primary">
                    <Button className="rounded-none">Add New User</Button>
                </Link>
            </div>

            <div className="relative">
                <Input
                    placeholder="Search by user name"
                    className="max-w-sm rounded-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="border overflow-x-auto max-h-[500px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Quota</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[48px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user, i) => (
                                <TableRow key={user.email + i}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{formatBytes(+user.usage)}</TableCell>
                                    <TableCell>{formatBytes(+user.mailbox_size)}</TableCell>
                                    <TableCell>{user.status}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleShowDetails(user)}
                                                variant="ghost"
                                                size="icon"
                                                title="Details"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            >
                                                <Info className="h-4 w-4" color="green" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="Reset Password"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => handleResetPassword(user)}
                                            >
                                                <RiLockPasswordLine className="h-4 w-4" color="green" />
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteClick(user)}
                                                variant="ghost"
                                                size="icon"
                                                title="Delete"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            >
                                                <Trash2 className="h-4 w-4" color="red" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {showServerDetails && selectedAccount && (
                <div className="mt-4">
                    <MailServerDetails selectedAccount={selectedAccount as any} />
                </div>
            )}
            {selectedAccount && (
                <Dialog open={isResetPasswordDialodOpen} onOpenChange={setIsResetPasswordDialogOpen}>
                    <DialogContent className="w-auto">
                        <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                            <DialogDescription>
                                This action will reset the password of the user. Do you want to continue?
                            </DialogDescription>
                        </DialogHeader>
                        <ResetPasswordForm email={selectedAccount?.email} />

                    </DialogContent>
                </Dialog>
            )}

            <AlertDialog open={isUserDeleteDialodOpen} onOpenChange={setIsUserDeleteDialodOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
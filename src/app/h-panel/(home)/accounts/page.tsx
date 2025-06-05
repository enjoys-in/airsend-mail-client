"use client"

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
import { Info, Loader2, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { API } from "@/lib/api/handler"
import { formatBytes } from "@/lib/utils"
import { ResetIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { Card } from "@/components/ui/card"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
interface User {
  name: string
  email: string
  password: string
  domain_name_id: string
}
interface RootObject {
  id: number;
  name: null;
  email: string;
  usage: string;
  mailbox_size: string;
  status: string;
  created_at: string;
}
export default function UserManagement() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<{ email: string, password: string } | null>(null)



  const [allUsers, setAllUsers] = useState<RootObject[] | []>([]);


  const fetchAllUsers = useCallback(async () => {
    try {
      const { data } = await API.handleGetAllUsers()
      if (!data.success) {
        throw new Error(data.message)
      }
      setAllUsers(data.result)
      setIsLoading(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      setIsLoading(false)

    }
  }, [])
  useEffect(() => {
    fetchAllUsers()
  }, [])

  const handleDeleteUser = async (key: string) => {
    try {
      const { data } = await API.handleDeleteUser(key)
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
  }
  const handleResetPassword = async (key: string) => {
    try {
      const { data } = await API.handleResetPassword(key)
      if (!data.success) {
        throw new Error(data.message)
      }
      toast({
        title: data.message,
        description: data.result,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }
  const filteredUsers = allUsers.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )
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
          placeholder="Search by user name "
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  </div>
                </TableCell>
              </TableRow>) : filteredUsers.length === 0 ? (<TableRow><TableCell colSpan={5} className="h-24 text-center">No users found.</TableCell></TableRow>) : filteredUsers.map((user, i) => (
                <TableRow key={user.email + i}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatBytes(+user.usage)}</TableCell>
                  <TableCell>{formatBytes(+user.mailbox_size)}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedAccount({
                          email: user.email,
                          password: "yourpassword",
                        })}
                        variant="ghost"
                        size="icon"
                        title="Details"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Info className="h-4 w-4" color="green" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Reset Password"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <ResetIcon className="h-4 w-4" color="green" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will reset the password of the user.
                              Do you want to continue?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleResetPassword(user.id.toString())}
                              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"

                            >
                              Reset Password
                            </AlertDialogAction>

                          </AlertDialogFooter>
                        </AlertDialogContent>

                      </AlertDialog>
                      <Button
                        onClick={() => handleDeleteUser(user.id.toString())}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="h-4 w-4" color="red" />
                      </Button>
                    </div>

                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      {selectedAccount && (
        <div className="mt-4">
          <OutgoingServerDetails selectedAccount={selectedAccount} />
        </div>
      )}
    </div>
  )
}
function OutgoingServerDetails({ selectedAccount }: { selectedAccount: any }) {
  return (
    <Card className="mt-4 container py-4">
      <h2 className="text-2xl font-bold tracking-tight">Outgoing Server Details</h2>
      <p className="text-sm text-muted-foreground">
        This is how you can use the outgoing server to send emails from your domain.
      </p>
      <div>
        <div className="grid grid-cols-2">
          <span>Host</span>
          <span>mail.enjoys.in</span>
        </div>
        <div className="grid grid-cols-2 font-sans">
          <span>Port</span>
          <span>587 (secure : false)</span>
        </div>
        <div className="grid grid-cols-2 font-sans">
          <span>Username/Email</span>
          <span>{selectedAccount.email}</span>
        </div>
        <div className="grid grid-cols-2 font-sans">
          <span>Password</span>
          <span>{selectedAccount.password}</span>
        </div>
      </div>

    </Card>
  )
}
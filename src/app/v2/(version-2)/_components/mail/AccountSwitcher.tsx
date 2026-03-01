"use client"

import * as React from "react"
import { ChevronsUpDown, Check, Plus, Mail } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { FavIcon } from "@/components/logo-image"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { setCurrAccount } from "@/store/slices/account"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatNameInParts } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"

export function AccountSwitcherV2() {
  const isMobile = useIsMobile()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const currAccount = useAppSelector(state => state.accounts.currAccount)
  const accounts = useAppSelector(state => state.accounts.accounts)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  const accountName = mounted ? (currAccount?.name ?? "") : ""
  const accountEmail = mounted ? (currAccount?.email ?? "") : ""
  const initials = mounted && accountName ? formatNameInParts(accountName) : ""

  const handleAccountSwitch = (account: typeof accounts[number]) => {
    dispatch(setCurrAccount({
      mid: "",
      email: account.email,
      domain_name: account.domain,
      tenant: account.domain,
      name: account.name,
      role: "USER",
      hasOrgs: null,
    }))
  }

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full items-center gap-2 p-2 h-auto justify-start data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
          >
            <Avatar className="h-8 w-8 rounded-full border border-border shrink-0">
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {initials || <FavIcon w={20} />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1 text-left">
              <span className="text-sm font-medium text-foreground truncate">
                {accountName}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {accountEmail}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          side={isMobile ? "bottom" : "right"}
          sideOffset={4}
        >
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Accounts
          </DropdownMenuLabel>
          {accounts.length > 0 ? (
            accounts.map((account) => {
              const isActive = currAccount?.email === account.email
              const accInitials = account.name ? formatNameInParts(account.name) : account.email.charAt(0).toUpperCase()
              return (
                <DropdownMenuItem
                  key={account.email}
                  onClick={() => handleAccountSwitch(account)}
                  className="gap-2 p-2 cursor-pointer"
                >
                  <Avatar className="h-6 w-6 rounded-full">
                    <AvatarFallback className="text-[10px] font-medium">
                      {accInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">{account.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{account.email}</span>
                  </div>
                  {isActive && <Check className="ml-auto h-4 w-4 text-primary shrink-0" />}
                </DropdownMenuItem>
              )
            })
          ) : (
            <DropdownMenuItem disabled className="gap-2 p-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{accountName}</span>
                <span className="text-xs text-muted-foreground truncate">{accountEmail}</span>
              </div>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 p-2 cursor-pointer"
            onClick={() => router.push("/v2/u/settings")}
          >
            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus className="size-4" />
            </div>
            <div className="font-medium text-muted-foreground">Add Account</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

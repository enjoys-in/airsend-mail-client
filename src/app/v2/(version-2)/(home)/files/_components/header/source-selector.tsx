"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { BoxIcon, DropboxIcon, GoogleDriveIcon, LogoIcon, OneDriveIcon, S3Icon } from "../icons";
import { useUserInfoProvider } from "../providers/user-info-provider";
import { useAccountProvider } from "../providers/account-provider";
import type { LimitedAccessAccount } from "../../_lib/files-types";
import { ScrollArea } from "../ui/scroll-area";
import { useNavigate } from "../../_lib/router-shim";
import { ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "../ui/button";

export function providerToIcon(providerId: string) {
  switch (providerId) {
    case "google":
      return <GoogleDriveIcon className="h-5 w-5" />;
    case "microsoft":
      return <OneDriveIcon className="h-5 w-5" />;
    case "box":
      return <BoxIcon className="h-5 w-5" />;
    case "dropbox":
      return <DropboxIcon className="h-5 w-5" />;
    case "s3":
      return <S3Icon className="h-5 w-5" />;
    default:
      return <LogoIcon className="h-5 w-5" />;
  }
}

export function SourceSelector() {
  const { providerId, accountId, setDriveProviderById } = useAccountProvider();
  const { accounts, isLoading } = useUserInfoProvider();
  const navigate = useNavigate();

  const currentAccount = accounts?.find(
    (acc) => acc.providerId === providerId && acc.accountId === accountId
  ) || accounts?.[0];

  const handleSelectAccount = (account: LimitedAccessAccount) => {
    setDriveProviderById(account.providerId, account.accountId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 text-sm font-semibold">
          {providerToIcon(providerId || "google")}
          <span className="truncate max-w-[120px]">{currentAccount?.nickname || providerId || "Google Drive"}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <ScrollArea className="max-h-60">
          {accounts && accounts.length > 0 ? (
            accounts.map((acc) => (
              <DropdownMenuItem
                key={acc.id}
                onClick={() => handleSelectAccount(acc)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {providerToIcon(acc.providerId)}
                <span className="truncate">{acc.nickname || acc.providerId}</span>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No accounts connected</DropdownMenuItem>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate({ search: (prev: any) => ({ ...prev, connectAccount: true }) })}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Connect new account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SourceSelector;

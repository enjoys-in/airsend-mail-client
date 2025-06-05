"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrAccount } from "@/store/slices/account";

export function AccountSwitcher() {
  const accounts = useAppSelector((state) => state.accounts.accounts);
  const currAccount = useAppSelector((state) => state.accounts.currAccount);
  const dispatch = useAppDispatch();
  if (!currAccount) return <div> No active Accounts</div>;
  return (
    <Select
      defaultValue={currAccount.email}
      // onValueChange={(e) => dispatch(setCurrAccount())}
    >
      <SelectTrigger
        className={cn(
          "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate",
          "bg-transparent border-none "
        )}
        aria-label="Select account"
      >
        <SelectValue placeholder="Select an account">
          <div className="w-full flex justify-between items-center">
            <div className="flex flex-row items-center gap-2">
              <Image
                src="/user.png"
                width={100}
                height={100}
                className="h-8 w-8 rounded-md"
                alt="profile photo"
              />
              <div className="flex flex-col items-start">
                <span className="font-bold text-xl">{currAccount.name}</span>
              </div>
            </div>
          </div>
        </SelectValue>
      </SelectTrigger>
      {accounts && accounts.length > 0 && <SelectContent>
        {accounts.map((account, idx) => (
          <SelectItem key={account.email} value={"" + account.email}>
            <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
              {account.email}
            </div>
          </SelectItem>
        ))}
      </SelectContent>}

    </Select>
  );
}

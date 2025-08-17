"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Info } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { airsendDB } from "@/db"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { fetchCurrentUser, setAccounts } from "@/store/slices/account"
import { QuotaResponse } from '@/lib/types/QuotaResponse';

import { formatBytes } from "@/lib/utils"

export default function ProfileSettings({ email }: { email: string }) {
  const { currAccount, accounts } = useAppSelector(state => state.accounts)
  const dispatch = useAppDispatch()

  const [selectedEmail, setSelectedEmail] = useState(currAccount?.email || email)
  const [footerEnabled, setFooterEnabled] = useState(true)
  const [secureEmailEnabled, setSecureEmailEnabled] = useState(true)
  const [quota, setQuota] = useState<Omit<QuotaResponse, "quota_in_percent"> | null>(null);

  // Always find selected account from Redux state
  const selectedAccount = useMemo(
    () => accounts.find(acc => acc.email === selectedEmail) || currAccount,
    [selectedEmail, accounts, currAccount]
  )

  // React Hook Form setup
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<{ display_name: string }>({
    defaultValues: { display_name: selectedAccount?.name || "" }
  })

  // Reset form whenever selectedAccount changes
  useEffect(() => {
    reset({ display_name: selectedAccount?.name || "" })
    airsendDB.getMultiNestedItem("settings", selectedAccount?.email as string,
      ["settings.usage", "settings.mailbox_size"]).then(res => {
        res.value?.settings && setQuota({
          usage: +res.value?.settings.usage,
          limit: +res.value?.settings.mailbox_size,
        })
      });
  }, [selectedAccount, reset])

  const watchedDisplayName = watch("display_name")
  const hasUnsavedChanges = watchedDisplayName !== selectedAccount?.name

  const onSubmit = async (data: { display_name: string }) => {
    if (!selectedAccount) return

    const res = await airsendDB.updateNestedItem(
      "settings",
      selectedAccount.email,
      "settings.user.display_name",
      data.display_name
    )

    if (res.success) {
      reset({ display_name: data.display_name })
      dispatch(fetchCurrentUser())
      dispatch(setAccounts(accounts.map(acc => (
        acc.email === selectedAccount.email ? { ...acc, name: data.display_name } : acc
      ))))
    }
  }

  return (
    <div className="text-white p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-200">Display name and signature</h1>

        {/* Email Select */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="w-full md:w-40 text-sm font-medium">Email address</Label>
          <div className="flex-1">
            <Select value={selectedEmail} onValueChange={setSelectedEmail}>
              <SelectTrigger className="w-full bg-black border-gray-700 text-white">
                <SelectValue
                  placeholder={currAccount?.email || email || "Select email"}
                  defaultValue={currAccount?.email || email}
                />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 text-white">
                {accounts.map(acc => (
                  <SelectItem key={acc.email} value={acc.email}>{acc.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Display Name Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label htmlFor="display-name" className="w-full md:w-40 text-sm font-medium">Display Name</Label>
            <div className="flex-1">
              <Input
                id="display-name"
                {...register("display_name", { required: true })}
                className="w-full bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2"
              />
              {errors.display_name && <p className="text-red-500 text-sm">Display name is required.</p>}
            </div>
          </div>

          {/* Usage & Limit */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label className="w-full md:w-40 text-sm font-medium">Current Usage</Label>
            <Input className="flex-1 bg-black border border-gray-700 rounded-md px-3 py-2" value={formatBytes(quota?.usage || 0)} readOnly />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label className="w-full md:w-40 text-sm font-medium">Limit</Label>
            <Input className="flex-1 bg-black border border-gray-700 rounded-md px-3 py-2" value={formatBytes(quota?.limit || 0)} readOnly />
          </div>
        </form>
        {/* Footer Toggle */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-full md:w-40 flex items-center gap-2">
            <label className="text-sm font-medium">Airsend Mail footer</label>
            <Info className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex-1 flex items-center gap-2">
            <Switch checked={footerEnabled} onCheckedChange={setFooterEnabled} className="data-[state=checked]:bg-blue-600" />
            <span className="text-blue-500 font-medium">Airsend Mail</span>
          </div>
        </div>

        {/* Secure Email Toggle */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-full md:w-40" />
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm text-gray-400">Sent with</span>
            <span className="text-blue-500 font-medium">Airsend Mail</span>
            <span className="text-sm text-gray-400">secure email.</span>
            <Switch checked={secureEmailEnabled} onCheckedChange={setSecureEmailEnabled} className="data-[state=checked]:bg-blue-600 ml-auto" />
          </div>
        </div>


      </div>

      {/* Save Changes Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 z-50">
          <Button onClick={handleSubmit(onSubmit)} className="bg-blue-600 text-white px-6 py-2 rounded shadow-lg hover:bg-blue-700">
            Save Changes
          </Button>
        </div>
      )}
    </div>
  )
}

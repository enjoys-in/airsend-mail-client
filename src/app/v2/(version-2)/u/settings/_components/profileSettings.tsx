"use client"

import React, { useState, useMemo, useEffect } from "react"
import {
  Info,
} from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import EmailSignature from "./signatures/emailSignature"
import { airsendDB } from "@/db"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { setAccounts } from "@/store/slices/account"
import { useFormState } from "react-dom"

export default function ProfileSettings({email}:{email:string}) {
  const { currAccount, accounts } = useAppSelector(state => state.accounts)
  const dispatch = useAppDispatch()
  // const t= useFormState()

  const [selectedEmail, setSelectedEmail] = useState(currAccount?.email)
  const [footerEnabled, setFooterEnabled] = useState(true)
  const [secureEmailEnabled, setSecureEmailEnabled] = useState(true)

  const selectedAccount = useMemo(
    () => accounts.find((acc) => acc.email === selectedEmail)!,
    [selectedEmail, accounts]
  )

  const initialValues = useMemo(
    () => ({ display_name: selectedAccount?.name || "" }),
    [selectedAccount]
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<{ display_name: string }>({ defaultValues: initialValues })

  useEffect(() => {
    reset({ display_name: selectedAccount?.name })
  }, [selectedAccount, reset])

  const watchedDisplayName = watch("display_name")
  const hasUnsavedChanges = watchedDisplayName !== initialValues.display_name

  const onSubmit = async (data: { display_name: string }) => {
    const res = await airsendDB.updateNestedItem(
      "settings",
      selectedAccount.email as string,
      "settings.user.display_name",
      data.display_name
    )

    if (res.success) {
      reset({ display_name: data.display_name })
      dispatch(setAccounts(accounts.map((acc) => {
        if (acc.email === selectedAccount.email) {
          return { ...acc, name: data.display_name }
        }
        return acc
      })))
    }
  }
  React.useEffect(() => {
    reset({ display_name: selectedAccount?.name })
  }, [selectedAccount, reset])
  return (
    <div className="text-white p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-200">Display name and signature</h1>

        {/* Email Address */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="w-full md:w-40 text-sm font-medium">Email address</Label>
          <div className="flex-1">
            <Select value={selectedEmail} onValueChange={setSelectedEmail}>
              <SelectTrigger className="w-full bg-black border-gray-700 text-white">
                <SelectValue placeholder="Select email" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 text-white">
                {accounts.map((acc) => (
                  <SelectItem key={acc.email} value={acc.email}>
                    {acc.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label htmlFor="display-name" className="w-full md:w-40 text-sm font-medium">Display Name</Label>
            <div className="flex-1">
              <Input
                id="display-name"
                {...register("display_name", { required: true })}
                className="w-full bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2"
              />
              {errors.display_name && (
                <p className="text-red-500 text-sm">Display name is required.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label className="w-full md:w-40 text-sm font-medium">Current Usage</Label>
            <Input
              className="flex-1 bg-black border border-gray-700 rounded-md focus:outline-none px-3 py-2"
              value={selectedAccount?.usage}
              readOnly
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label className="w-full md:w-40 text-sm font-medium">Limit</Label>
            <Input
              className="flex-1 bg-black border border-gray-700 rounded-md focus:outline-none px-3 py-2"
              value={selectedAccount?.limit}
              readOnly
            />
          </div>
        </form>

        {/* Signature - Responsive Layout */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-40 flex items-start gap-2">
            <label className="text-sm font-medium">Signature</label>
            <Info className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex-1">
            <EmailSignature selectedAccount={selectedAccount} />
          </div>
        </div>

        {/* Footer Toggle */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-full md:w-40 flex items-center gap-2">
            <label className="text-sm font-medium">Airsend Mail footer</label>
            <Info className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex-1 flex items-center gap-2">
            <Switch
              checked={footerEnabled}
              onCheckedChange={setFooterEnabled}
              className="data-[state=checked]:bg-blue-600"
            />
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
            <Switch
              checked={secureEmailEnabled}
              onCheckedChange={setSecureEmailEnabled}
              className="data-[state=checked]:bg-blue-600 ml-auto"
            />
          </div>
        </div>
      </div>

      {/* Save Changes Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 z-50">
          <Button
            onClick={handleSubmit(onSubmit)}
            className="bg-blue-600 text-white px-6 py-2 rounded shadow-lg hover:bg-blue-700"
          >
            Save Changes
          </Button>
        </div>
      )}
    </div>
  )
}

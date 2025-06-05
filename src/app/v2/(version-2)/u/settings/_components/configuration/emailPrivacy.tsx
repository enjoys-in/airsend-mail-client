"use client"
import React, { useState } from "react"
import { InfoIcon as InfoCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { airsendDB } from "@/db"
import { useAppSelector } from "@/store/hooks"
import { useSettingsStore } from "@/store/settings"



const EmailPrivacy = () => {

  const currAccount = useAppSelector((state) => state.accounts.currAccount)
  const { settings, setSettings } = useSettingsStore()
  const handleChange = async (value: any) => {
    if (!currAccount?.email) return
    setSettings({ email_privacy: value })
    await airsendDB.updateNestedItem("settings", currAccount.email, "settings.email_privacy", value as any)
  }

  return (
    <div className="  text-white p-8">
      <div className="max-w-2xl mx-auto space-y-12">

        <div className="space-y-6">
          <h1 className="text-3xl font-bold  text-white ">Email Privacy</h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Auto show remote images</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Switch
              checked={settings?.email_privacy?.autoShowImages}
              onCheckedChange={(checked) => handleChange({
                ...settings?.email_privacy,
                autoShowImages: checked
              })}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Block email tracking</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Switch
              checked={settings?.email_privacy?.block_email_tracking}
              onCheckedChange={(checked) => handleChange({
                ...settings?.email_privacy,
                block_email_tracking: checked
              })}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>


        </div>


      </div>
    </div>
  )
}

export default EmailPrivacy
"use client"

import * as React from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

const domains = [
  { value: "acme.com", label: "acme.com" },
  { value: "acme.org", label: "acme.org" },
  { value: "example.com", label: "example.com" },
]

const accounts = {
  "acme.com": [
    { value: "admin@acme.com", label: "admin@acme.com" },
    { value: "user@acme.com", label: "user@acme.com" },
  ],
  "acme.org": [{ value: "admin@acme.org", label: "admin@acme.org" }],
  "example.com": [
    { value: "admin@example.com", label: "admin@example.com" },
    { value: "support@example.com", label: "support@example.com" },
  ],
}

export default function ManageSettingsPage({ params }: { params: any }) {
  const [selectedDomain, setSelectedDomain] = React.useState<string>("")
  const [selectedAccount, setSelectedAccount] = React.useState<string>("")
  const [settings, setSettings] = React.useState({
    emailNotifications: true,
    twoFactorAuth: false,
    apiAccess: true,
    dataRetention: "30",
  })

  const availableAccounts = selectedDomain ? accounts[selectedDomain as keyof typeof accounts] || [] : []

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Manage Settings - {params.id}</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Domain & Account Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Select Domain</Label>
                <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain) => (
                      <SelectItem key={domain.value} value={domain.value}>
                        {domain.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">Select Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount} disabled={!selectedDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAccounts.map((account) => (
                      <SelectItem key={account.value} value={account.value}>
                        {account.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedDomain && selectedAccount && (
          <Card>
            <CardHeader>
              <CardTitle>Settings for {selectedAccount}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Enable 2FA for enhanced security</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, twoFactorAuth: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>API Access</Label>
                  <p className="text-sm text-muted-foreground">Allow API access for this account</p>
                </div>
                <Switch
                  checked={settings.apiAccess}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, apiAccess: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retention">Data Retention (days)</Label>
                <Input
                  id="retention"
                  type="number"
                  value={settings.dataRetention}
                  onChange={(e) => setSettings((prev) => ({ ...prev, dataRetention: e.target.value }))}
                  className="max-w-[200px]"
                />
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarInset>
  )
}

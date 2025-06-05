"use client"

import * as React from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
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

export default function DangerZonePage() {
  const [confirmText, setConfirmText] = React.useState("")
  const [selectedOrg, setSelectedOrg] = React.useState("")

  const isDeleteEnabled = confirmText === "DELETE" && selectedOrg

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
       
        <h1 className="text-lg font-semibold">Danger Zone</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Delete Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-red-600">
                <strong>Warning:</strong> This action cannot be undone. Deleting an organization will:
              </p>
              <ul className="list-disc list-inside text-sm text-red-600 space-y-1 ml-4">
                <li>Permanently delete the organization and all its data</li>
                <li>Delete all associated domains</li>
                <li>Delete all user accounts within the organization</li>
                <li>Remove all settings and configurations</li>
                <li>This action is not reversible</li>
              </ul>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="org-select">Select Organization to Delete</Label>
                <select
                  id="org-select"
                  className="w-full p-2 border rounded-md"
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                >
                  <option value="">Choose an organization...</option>
                  <option value="ORG001">ORG001 - Acme Corporation</option>
                  <option value="ORG002">ORG002 - TechStart Inc</option>
                  <option value="ORG003">ORG003 - Global Solutions</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Type "DELETE" to confirm</Label>
                <Input
                  id="confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="max-w-[200px]"
                />
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={!isDeleteEnabled} className="w-full max-w-[200px]">
                    Delete Organization
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the organization "{selectedOrg}" and all of its data. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        console.log(`Deleting organization: ${selectedOrg}`)
                        // Handle deletion logic here
                        setConfirmText("")
                        setSelectedOrg("")
                      }}
                    >
                      Yes, delete organization
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

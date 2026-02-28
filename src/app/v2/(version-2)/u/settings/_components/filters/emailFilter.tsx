"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddFilterDialog } from "./addFilterDialog"
import { SieveFilterDialog } from "./sieveFilterDialog"
import { useSettingsStore } from "@/store/settings"
import { SettingsPageHeader } from "../shared"

export default function EmailFilters({ email }: { email: string }) {
  const setActiveItem = useSettingsStore((s) => s.setActiveItem)
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-12">
        <SettingsPageHeader
          title="Filters"
          description="Manage email filters and spam rules"
        />

        {/* Custom filters section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Custom filters</h2>
          <p className="text-muted-foreground">
            Add a custom filter to automatically perform certain actions, like labeling or archiving messages.
          </p>
          <a href="#" className="text-primary hover:underline block mb-4">
            Learn more
          </a>
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Add custom filter
                </Button>
              </DialogTrigger>
              <DialogContent
                className="w-full max-w-3xl"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
              >
                <DialogHeader>
                  <DialogTitle>Add custom filter</DialogTitle>
                  <DialogDescription>
                    Add a custom filter to automatically perform certain actions, like labeling or archiving messages.
                  </DialogDescription>
                </DialogHeader>
                <AddFilterDialog />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Add sieve filter
                </Button>
              </DialogTrigger>
              <DialogContent
                className="w-full max-w-3xl"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
              >
                <DialogHeader>
                  <DialogTitle>Add sieve filter</DialogTitle>
                  <DialogDescription>
                    Write a custom sieve script to create advanced email filtering rules.
                  </DialogDescription>
                </DialogHeader>
                <SieveFilterDialog />
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Spam, block, and allow lists section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Spam, block, and allow lists</h2>
          <p className="text-muted-foreground">Take control over what lands in your inbox by creating the following lists:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">Spam:</span> To prevent junk mail from clogging up your inbox
            </li>
            <li>
              <span className="font-semibold text-foreground">Block:</span> To stop phishing or suspicious emails from entering your
              email system
            </li>
            <li>
              <span className="font-semibold text-foreground">Allow:</span> To ensure critical messages don&apos;t end up in spam and getting
              missed
            </li>
          </ul>
          <a href="#" className="text-primary hover:underline block mb-4">
            Learn more
          </a>
          <div>
            <Button onClick={() => setActiveItem("email-config")} className="flex items-center gap-2">
              Add address or domain
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

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
export default function EmailFilters({email}:{email:string}) {
  const {setActiveItem}= useSettingsStore()
  return (
    <div className="text-white p-8">
      <div className="max-w-3xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold mb-12 text-white ">Filters</h1>

        {/* Custom filters section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Custom filters</h2>
          <p className="text-gray-300">
            Add a custom filter to automatically perform certain actions, like labeling or archiving messages.
          </p>
          <a href="#" className="text-blue-500 hover:underline block mb-4">
            Learn more
          </a>
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-transparent border-gray-700 text-white hover:bg-gray-800">
                  Add custom filter
                </Button>
              </DialogTrigger>
              <DialogContent
              className="w-full max-w-3xl"
              onPointerDownOutside={(e) => e.preventDefault()}
              onInteractOutside={(e) => e.preventDefault()}>
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
                <Button variant="outline" className="bg-transparent border-gray-700 text-white hover:bg-gray-800">
                  Add sieve filter
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
                <SieveFilterDialog />
              </DialogContent>
            </Dialog>

          </div>
        </section>

        {/* Spam, block, and allow lists section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Spam, block, and allow lists</h2>
          <p className="text-gray-300">Take control over what lands in your inbox by creating the following lists:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-300">
            <li>
              <span className="font-semibold">Spam:</span> To prevent junk mail from clogging up your inbox
            </li>
            <li>
              <span className="font-semibold">Block:</span> To stop phishing or suspicious emails from entering your
              email system
            </li>
            <li>
              <span className="font-semibold">Allow:</span> To ensure critical messages don't end up in spam and getting
              missed
            </li>
          </ul>
          <a href="#" className="text-blue-500 hover:underline block mb-4">
            Learn more
          </a>
          <div>
            <Button onClick={() => setActiveItem("Email Config")}  variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              Add address or domain
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

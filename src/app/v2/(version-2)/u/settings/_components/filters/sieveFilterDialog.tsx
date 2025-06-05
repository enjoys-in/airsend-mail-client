"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"



export function SieveFilterDialog() {
  const [filterName, setFilterName] = useState("")

  // Default Sieve script template
  const defaultScript = `require ["include", "environment", "variables", "relational", "comparator-i;ascii-numeric", "spamtest"];

# Generated: Do not run this script on spam messages
if allof (environment :matches "vnd.proton.spam-threshold" "*",
spamtest :value "ge" :comparator "i;ascii-numeric" "${1}") 
{
  return;
}

`

  return (
    <div className="p-6">


      <div className="mb-4">
        <label htmlFor="filter-name" className="block text-gray-300 mb-2">
          Filter Name
        </label>
        <Input
          id="filter-name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder="Name"
          className="bg-transparent border-blue-600 text-white focus:border-blue-500 focus:ring-0"
        />
      </div>

      <div className="bg-[#121214] rounded border border-gray-800 mb-6 overflow-hidden">
        <pre className="p-4 text-sm font-mono overflow-auto max-h-[400px]">

        </pre>
      </div>

      <div className="flex justify-between">
        <Button className="bg-gray-700 hover:bg-gray-600 text-white">Save</Button>
      </div>
    </div>
  )
}

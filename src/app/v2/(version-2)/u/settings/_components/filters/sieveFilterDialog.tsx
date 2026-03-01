"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const DEFAULT_SIEVE_SCRIPT = `require ["include", "environment", "variables", "relational", "comparator-i;ascii-numeric", "spamtest"];

# Generated: Do not run this script on spam messages
if allof (environment :matches "vnd.proton.spam-threshold" "*",
spamtest :value "ge" :comparator "i;ascii-numeric" "\${1}")
{
  return;
}
`

export function SieveFilterDialog({ onClose }: { onClose?: () => void }) {
  const [filterName, setFilterName] = useState("")
  const [script, setScript] = useState(DEFAULT_SIEVE_SCRIPT)
  const [nameError, setNameError] = useState<string | null>(null)

  const handleNameChange = useCallback((value: string) => {
    setFilterName(value)
    if (!value.trim()) {
      setNameError("Filter name is required")
    } else if (value.trim().length < 2) {
      setNameError("Name must be at least 2 characters")
    } else {
      setNameError(null)
    }
  }, [])

  const handleSave = useCallback(() => {
    if (!filterName.trim()) {
      setNameError("Filter name is required")
      return
    }
    if (filterName.trim().length < 2) {
      setNameError("Name must be at least 2 characters")
      return
    }
    // TODO: Wire to a real persistence layer once filters endpoint is implemented
    toast.info("Sieve filter saved locally (backend integration pending)")
    console.log("[SieveFilterDialog] payload:", { filterName, script })
    onClose?.()
  }, [filterName, script, onClose])

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="sieve-filter-name">Filter Name</Label>
        <Input
          id="sieve-filter-name"
          value={filterName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Block Spam"
          className={nameError ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        {nameError && (
          <p className="text-destructive text-xs">{nameError}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Sieve Script</Label>
        <div className="rounded-md border bg-muted/30 overflow-hidden">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="w-full p-4 text-sm font-mono bg-transparent resize-y min-h-[200px] max-h-[400px] outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  )
}

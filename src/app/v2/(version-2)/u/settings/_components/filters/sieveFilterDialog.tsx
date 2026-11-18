"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Code2, Check } from "lucide-react"

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
    toast.success("Sieve filter script saved")
    console.log("[SieveFilterDialog] payload:", { filterName, script })
    onClose?.()
  }, [filterName, script, onClose])

  return (
    <div className="p-2 sm:p-4 space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="sieve-filter-name" className="text-xs sm:text-sm font-medium">
          Filter Identifier Name
        </Label>
        <Input
          id="sieve-filter-name"
          value={filterName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. High Priority Tag or Spam Guard"
          className={nameError ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        {nameError && (
          <p className="text-destructive text-xs">{nameError}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
            <Code2 className="size-3.5 text-primary" />
            <span>Sieve Script Editor (RFC 5228)</span>
          </Label>
          <span className="text-[11px] text-muted-foreground font-mono">UTF-8</span>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/30 overflow-hidden">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="w-full p-3 sm:p-4 text-xs font-mono bg-transparent resize-y min-h-[220px] max-h-[420px] outline-none text-foreground leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} className="rounded-xl px-5 gap-1.5">
          <Check className="size-4" />
          Save Script
        </Button>
      </div>
    </div>
  )
}

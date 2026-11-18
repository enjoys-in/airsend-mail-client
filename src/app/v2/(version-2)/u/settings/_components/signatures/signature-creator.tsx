"use client"

import React, { useEffect, useState, useCallback, memo } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SignatureCanvas } from "./signature-canvas"
import { SignatureEditor } from "./signature-editor"
import { Plus, Trash2, Upload, Check, Pencil, FileText, Star, Pen } from "lucide-react"
import { useSignatureEditorStore } from "@/store/settings"
import { useSettingsPersist } from "@/hooks/use-settings-persist"
import { SettingsPageHeader, SaveSettingsBar } from "../shared"
import type { ISignature } from "@/lib/types/get-user-settings-response"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Validation helpers                                                 */
/* ------------------------------------------------------------------ */

function validateSignatureName(
  name: string,
  currentIndex: number,
  all: ISignature[],
): string | null {
  const trimmed = name.trim()
  if (!trimmed) return "Signature name is required"
  if (trimmed.length < 2) return "Name must be at least 2 characters"
  const isDuplicate = all.some(
    (s, i) => i !== currentIndex && s.name.trim().toLowerCase() === trimmed.toLowerCase(),
  )
  if (isDuplicate) return "A signature with this name already exists"
  return null
}

function validateAllSignatures(sigs: ISignature[]): { index: number; error: string } | null {
  for (let i = 0; i < sigs.length; i++) {
    const err = validateSignatureName(sigs[i].name, i, sigs)
    if (err) return { index: i, error: err }
  }
  return null
}

/* ------------------------------------------------------------------ */
/*  Signature List (memoised sub-component)                           */
/* ------------------------------------------------------------------ */

interface SignatureListProps {
  signatures: ISignature[]
  selectedIndex: number
  onSelect: (index: number) => void
  onRemove: (index: number) => void
  onSetDefault: (index: number) => void
  onAdd: () => void
}

const SignatureList = memo(function SignatureList({
  signatures,
  selectedIndex,
  onSelect,
  onRemove,
  onSetDefault,
  onAdd,
}: SignatureListProps) {
  return (
    <Card className="rounded-2xl border-border/70 bg-card/70 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">Configured Signatures</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Create multiple signatures for work, personal, or legal communications
            </CardDescription>
          </div>
          <Button onClick={onAdd} type="button" size="sm" className="h-8 rounded-xl text-xs gap-1.5">
            <Plus className="size-3.5" />
            New Signature
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {signatures.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              No signatures created yet. Click &quot;New Signature&quot; to begin.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {signatures.map((sig, index) => {
              const isSelected = selectedIndex === index
              return (
                <div
                  key={sig.key}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all duration-150",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-2xs ring-1 ring-primary/30"
                      : "border-border/60 bg-background/50 hover:border-border hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "size-2 rounded-full shrink-0",
                        sig.default ? "bg-amber-500" : "bg-muted-foreground/40"
                      )}
                    />
                    <span className="text-xs sm:text-sm font-medium truncate text-foreground">
                      {sig.name || <span className="text-muted-foreground italic">Untitled Signature</span>}
                    </span>
                    {sig.default && (
                      <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 py-0 px-1.5">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {!sig.default && (
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="size-8 rounded-lg text-muted-foreground hover:text-amber-500"
                        onClick={() => onSetDefault(index)}
                        title="Set as default"
                      >
                        <Star className="size-3.5" />
                      </Button>
                    )}
                    <Button
                      variant={isSelected ? "secondary" : "outline"}
                      size="sm"
                      type="button"
                      className="h-7 text-xs rounded-lg px-2.5"
                      onClick={() => onSelect(index)}
                    >
                      {isSelected ? "Editing" : "Edit"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      type="button"
                      onClick={() => onRemove(index)}
                      title="Delete signature"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

/* ------------------------------------------------------------------ */
/*  Main orchestrator                                                  */
/* ------------------------------------------------------------------ */

function SignatureCreator({ email }: { email: string }) {
  const { type, setType } = useSignatureEditorStore()
  const { settings, save, isSaving } = useSettingsPersist(email)

  const [signatures, setSignatures] = useState<ISignature[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [dirty, setDirty] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  /* ---- hydrate from store ---- */
  useEffect(() => {
    const sigs = settings?.signatures
    if (sigs && Array.isArray(sigs) && sigs.length > 0 && !dirty) {
      setSignatures(sigs as ISignature[])
      const defaultIdx = (sigs as ISignature[]).findIndex((s) => s.default)
      setSelectedIndex(defaultIdx >= 0 ? defaultIdx : 0)
    }
  }, [settings?.signatures]) // eslint-disable-line react-hooks/exhaustive-deps

  const selected = signatures[selectedIndex]

  /* ---- mutations ---- */

  const handleAdd = useCallback(() => {
    const newSig: ISignature = {
      key: crypto.randomUUID(),
      name: "",
      line: "",
      default: signatures.length === 0,
      type: "text",
    }
    setSignatures((prev) => [...prev, newSig])
    setSelectedIndex(signatures.length)
    setDirty(true)
    setNameError(null)
  }, [signatures.length])

  const handleRemove = useCallback(
    (index: number) => {
      setSignatures((prev) => {
        const next = prev.filter((_, i) => i !== index)
        if (prev[index]?.default && next.length > 0) {
          next[0] = { ...next[0], default: true }
        }
        return next
      })
      setSelectedIndex((prev) => {
        const maxIdx = Math.max(0, signatures.length - 2)
        if (prev > index) return prev - 1
        if (prev >= signatures.length - 1) return maxIdx
        return prev
      })
      setDirty(true)
      setNameError(null)
    },
    [signatures.length],
  )

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index)
    setNameError(null)
  }, [])

  const handleSetDefault = useCallback((index: number) => {
    setSignatures((prev) => prev.map((s, i) => ({ ...s, default: i === index })))
    setDirty(true)
  }, [])

  const handleNameChange = useCallback(
    (value: string) => {
      setSignatures((prev) =>
        prev.map((s, i) => (i === selectedIndex ? { ...s, name: value } : s)),
      )
      setNameError((prevErr) => {
        const updated = signatures.map((s, i) =>
          i === selectedIndex ? { ...s, name: value } : s,
        )
        return validateSignatureName(value, selectedIndex, updated)
      })
      setDirty(true)
    },
    [selectedIndex, signatures],
  )

  const handleLineChange = useCallback(
    (line: string, lineType: ISignature["type"]) => {
      setSignatures((prev) =>
        prev.map((s, i) => (i === selectedIndex ? { ...s, line, type: lineType } : s)),
      )
      setDirty(true)
    },
    [selectedIndex],
  )

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) handleLineChange(result, "upload")
      }
      reader.readAsDataURL(file)
    },
    [handleLineChange],
  )

  /* ---- save & reset ---- */

  const handleSave = useCallback(async () => {
    const invalid = validateAllSignatures(signatures)
    if (invalid) {
      setSelectedIndex(invalid.index)
      setNameError(invalid.error)
      toast.error(
        `Signature "${signatures[invalid.index].name || `#${invalid.index + 1}`}": ${invalid.error}`,
      )
      return
    }
    await save("signatures", signatures)
    setDirty(false)
    toast.success("Signatures saved")
  }, [signatures, save])

  const handleReset = useCallback(() => {
    const sigs = settings?.signatures
    if (sigs && Array.isArray(sigs)) {
      setSignatures(sigs as ISignature[])
      const defaultIdx = (sigs as ISignature[]).findIndex((s) => s.default)
      setSelectedIndex(defaultIdx >= 0 ? defaultIdx : 0)
    } else {
      setSignatures([])
      setSelectedIndex(0)
    }
    setDirty(false)
    setNameError(null)
  }, [settings?.signatures])

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-150">
      <SettingsPageHeader
        title="Signatures"
        description="Design professional email signatures with rich text, drawn handwriting, or uploaded graphics."
        icon={<Pen className="size-5" />}
        badge={<Badge variant="outline" className="text-xs font-normal">Composer</Badge>}
      />

      <div className="space-y-6">
        {/* ---- Signature list ---- */}
        <SignatureList
          signatures={signatures}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
          onRemove={handleRemove}
          onSetDefault={handleSetDefault}
          onAdd={handleAdd}
        />

        {/* ---- Signature editor ---- */}
        {selected && (
          <Card className="rounded-2xl border-border/70 bg-card/70 shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base sm:text-lg">Signature Editor</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Customize formatting for &quot;{selected.name || "Untitled"}&quot;
                  </CardDescription>
                </div>
                {/* Segmented editor type tabs */}
                <div className="inline-flex p-1 rounded-xl bg-muted/60 border border-border/50 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setType("editor")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all",
                      type === "editor"
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <FileText className="size-3.5" />
                    <span>Rich Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("canvas")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all",
                      type === "canvas"
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Pencil className="size-3.5" />
                    <span>Draw</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("upload")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all",
                      type === "upload"
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Upload className="size-3.5" />
                    <span>Upload Image</span>
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name input with validation */}
              <div className="space-y-1.5">
                <Label htmlFor="signatureName" className="text-xs sm:text-sm font-medium">
                  Signature Label
                </Label>
                <Input
                  id="signatureName"
                  value={selected.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Work Signature, Formal, or Mobile"
                  className={cn(
                    "h-9 text-xs sm:text-sm rounded-xl bg-background",
                    nameError && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {nameError && (
                  <p className="text-destructive text-xs">{nameError}</p>
                )}
              </div>

              {/* Canvas / Editor / Upload */}
              {type === "canvas" && (
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Draw Handwritten Signature</Label>
                  <div className="rounded-xl border border-border/70 overflow-hidden bg-background">
                    <SignatureCanvas
                      onSave={(data) => handleLineChange(data, "blob")}
                    />
                  </div>
                </div>
              )}

              {type === "editor" && (
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Formatted Text Editor</Label>
                  <div className="rounded-xl border border-border/70 overflow-hidden bg-background">
                    <SignatureEditor
                      value={selected.line || ""}
                      onChange={(value) => handleLineChange(value, "text")}
                    />
                  </div>
                </div>
              )}

              {type === "upload" && (
                <div className="space-y-2">
                  <Label htmlFor="uploadSignature" className="text-xs sm:text-sm font-medium">Upload Image Signature</Label>
                  <label
                    htmlFor="uploadSignature"
                    className="flex flex-col items-center justify-center w-full h-36 px-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors border-border/70 hover:border-primary/50 bg-muted/20"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="size-5 text-muted-foreground" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        Drop image or click to browse
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        PNG, JPG, SVG or GIF up to 2MB
                      </span>
                    </div>
                    <Input
                      id="uploadSignature"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              )}

              {/* Preview of current signature */}
              {selected.line && (
                <div className="rounded-xl border border-border/70 p-4 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Live Preview
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {selected.type}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border/40">
                    {selected.type === "blob" || selected.type === "upload" ? (
                      <img
                        src={selected.line}
                        alt="Signature preview"
                        className="max-h-24 max-w-full object-contain"
                      />
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{ __html: selected.line }}
                        className="text-xs sm:text-sm prose prose-sm dark:prose-invert max-w-none"
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <SaveSettingsBar
        onSave={handleSave}
        onReset={handleReset}
        show={dirty}
        isSaving={isSaving}
      />
    </div>
  )
}

const MemoizedSignatureCreator = memo(SignatureCreator)

export { MemoizedSignatureCreator as SignatureCreator }

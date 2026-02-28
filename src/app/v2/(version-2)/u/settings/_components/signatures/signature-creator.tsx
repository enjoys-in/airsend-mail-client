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
import { Plus, Trash2, Upload, Check, Pencil, FileText, Star } from "lucide-react"
import { useSignatureEditorStore } from "@/store/settings"
import { useSettingsPersist } from "@/hooks/use-settings-persist"
import { SettingsPageHeader, SaveSettingsBar } from "../shared"
import type { ISignature } from "@/lib/types/get-user-settings-response"
import { toast } from "sonner"

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Signatures</CardTitle>
            <CardDescription>Select or create new signatures</CardDescription>
          </div>
          <Button onClick={onAdd} type="button" size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {signatures.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No signatures yet. Click &quot;Add New&quot; to create one.
          </p>
        ) : (
          <div className="space-y-2">
            {signatures.map((sig, index) => (
              <div
                key={sig.key}
                className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
                  selectedIndex === index
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {selectedIndex === index && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                  <span className="font-medium truncate">
                    {sig.name || <span className="text-muted-foreground italic">Untitled</span>}
                  </span>
                  {sig.default && (
                    <Star className="h-3.5 w-3.5 shrink-0 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {!sig.default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => onSetDefault(index)}
                      title="Set as default"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => onSelect(index)}
                    disabled={selectedIndex === index}
                  >
                    {selectedIndex === index ? "Editing" : "Edit"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    type="button"
                    onClick={() => onRemove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
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
      // Live validation
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
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <SettingsPageHeader
          title="Signatures"
          description="Create and manage email signatures"
        />

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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Signature Editor</CardTitle>
                  <CardDescription>Customize your signature</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant={type === "canvas" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    type="button"
                    onClick={() => setType("canvas")}
                    title="Draw"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={type === "upload" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    type="button"
                    onClick={() => setType("upload")}
                    title="Upload"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={type === "editor" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    type="button"
                    onClick={() => setType("editor")}
                    title="Text editor"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name input with validation */}
              <div className="space-y-1.5">
                <Label htmlFor="signatureName">Signature Name</Label>
                <Input
                  id="signatureName"
                  value={selected.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Work, Personal"
                  className={nameError ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {nameError && (
                  <p className="text-destructive text-xs">{nameError}</p>
                )}
              </div>

              {/* Canvas / Editor / Upload based on type */}
              {type === "canvas" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Draw Signature</h3>
                  <SignatureCanvas
                    onSave={(data) => handleLineChange(data, "blob")}
                  />
                </div>
              )}

              {type === "editor" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Rich Text Editor</h3>
                  <SignatureEditor
                    value={selected.line || ""}
                    onChange={(value) => handleLineChange(value, "text")}
                  />
                </div>
              )}

              {type === "upload" && (
                <div className="space-y-2">
                  <Label htmlFor="uploadSignature">Upload Signature</Label>
                  <label
                    htmlFor="uploadSignature"
                    className="flex items-center justify-center w-full h-32 px-4 border-2 border-dashed rounded-md cursor-pointer transition-colors border-muted-foreground/25 hover:border-muted-foreground/50 bg-muted/30"
                  >
                    <span className="flex items-center gap-2">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Drop files to upload or click
                      </span>
                    </span>
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
                <div className="rounded-md border p-3 bg-muted/20">
                  <p className="text-xs text-muted-foreground mb-2">Preview</p>
                  {selected.type === "blob" || selected.type === "upload" ? (
                    <img
                      src={selected.line}
                      alt="Signature preview"
                      className="max-h-20 max-w-full"
                    />
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{ __html: selected.line }}
                      className="text-sm"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <SaveSettingsBar
          onSave={handleSave}
          onReset={handleReset}
          show={dirty}
          isSaving={isSaving}
        />
      </div>
    </div>
  )
}

const MemoizedSignatureCreator = memo(SignatureCreator)

export { MemoizedSignatureCreator as SignatureCreator }

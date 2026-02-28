"use client"

import React, { useEffect } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SignatureCanvas } from "./signature-canvas"
import { SignatureEditor } from "./signature-editor"
import { Plus, Trash2, Upload, Check, Info, Pencil, FileText } from "lucide-react"
import { useSettingsStore, useSignatureEditorStore } from "@/store/settings"
import { airsendDB } from "@/db"
import { toast } from "sonner"
import { API } from "@/lib/api/handler"

/** Return index if >= 0, otherwise fallback */
const safeIndex = (idx: number, fallback = 0) => (idx >= 0 ? idx : fallback)

type Signature = {
  key: string;
  name: string;
  line: string;
  default: boolean;
  type: "blob" | "text" | "upload";
};

interface SignatureFormValues {
  signatures: Signature[];
  selectedSignatureIndex: number;
}

export function SignatureCreator({ email }: { email: string }) {
  const { type, setType } = useSignatureEditorStore()
  const settings = useSettingsStore((s) => s.settings)
  const setSettings = useSettingsStore((s) => s.setSettings)

  const { control, register, handleSubmit, watch, setValue, getValues } = useForm<SignatureFormValues>({
    defaultValues: {
      signatures: [],
      selectedSignatureIndex: 0
    }
  })

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "signatures"
  })

  const selectedSignatureIndex = watch("selectedSignatureIndex")
  const signatures = watch("signatures")

  const selectedSignature = signatures[selectedSignatureIndex]

  const onSubmit = async (data: SignatureFormValues) => {
    if (!email) return toast.error("Please select an account")
    const res = await airsendDB.updateNestedItem("settings", email as string, "settings.signatures", data.signatures as any)
    if (res.success) {
      setValue("signatures", res.newValue as any)
      setValue("selectedSignatureIndex", safeIndex(
        res.newValue?.findIndex((s: any) => s.default) ?? -1,
        selectedSignatureIndex
      ))
      setSettings({ signatures: res.newValue as any })
      toast.success("Signatures saved")
    }
  }

  const handleAddSignature = () => {
    const newIdx = fields.length
    append({
      key: `signature-${newIdx + 1}`,
      line: "",
      type: "text",
      name: `Signature ${newIdx + 1}`,
      default: newIdx === 0
    })
    // Auto-select the newly added signature
    setValue("selectedSignatureIndex", newIdx)
  }

  const handleRemoveSignature = (index: number) => {
    remove(index)
    // Adjust selected index to stay in bounds
    if (selectedSignatureIndex >= fields.length - 1) {
      setValue("selectedSignatureIndex", Math.max(0, fields.length - 2))
    } else if (selectedSignatureIndex > index) {
      setValue("selectedSignatureIndex", selectedSignatureIndex - 1)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          update(selectedSignatureIndex, {
            ...selectedSignature,
            line: result,
            type: "upload"
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    if (!email) return

    async function loadSignatures() {

      if (settings?.signatures && settings.signatures.length > 0) {
        setValue("selectedSignatureIndex", safeIndex(
          (settings.signatures as any[]).findIndex((s: any) => s.default)
        ))
        return setValue("signatures", settings.signatures as any)
      }
      const idbData = await airsendDB.getNestedItem(
        "settings",
        email as string,
        "settings.signatures"
      )

      if (idbData.success && idbData?.value && idbData?.value.length > 0) {

        setValue("signatures", idbData.value as any)
        setValue("selectedSignatureIndex", safeIndex(
          idbData?.value.findIndex((s: any) => s.default) ?? -1
        ))
      } else {
        const { data } = await API.handleGetMailUserSetting(`${idbData?.path}&=email=${email}`)
        if (data.success) {
          // data.result may be the full settings object or a signatures array
          const sigs: any[] = Array.isArray(data.result)
            ? data.result
            : Array.isArray(data.result?.settings?.signatures)
              ? data.result.settings.signatures
              : Array.isArray(data.result?.signatures)
                ? data.result.signatures
                : []
          if (sigs.length > 0) {
            setValue("signatures", sigs as any)
            setValue("selectedSignatureIndex", safeIndex(
              sigs.findIndex((s: any) => s.default) ?? -1
            ))
            await airsendDB.updateNestedItem(
              "settings",
              email as string,
              "settings.signatures",
              sigs
            )
          }
        }
      }
    }

    loadSignatures()

  }, [email])

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-40 flex items-start gap-2">
        <label className="text-sm font-medium">Signature</label>
        <Info className="h-4 w-4 text-blue-500" />
      </div>
      <div className="flex-1">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 px-4 sm:px-6 md:px-10">

            {/* Signature List */}
            <Card className="col-span-8 w-full">
              <CardHeader>
                <CardTitle>Your Signatures</CardTitle>
                <CardDescription>Select or create new signatures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Signatures</h3>
                  <Button onClick={handleAddSignature} type="button" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                </div>
                {signatures.length > 0 && <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md border space-y-2 sm:space-y-0 ${selectedSignatureIndex === index ? "border-primary bg-primary/10" : "border-border"}`}
                    >

                      <div className="flex items-center">
                        {selectedSignatureIndex === index && <Check className="h-4 w-4 mr-2 text-primary" />}
                        <span className="font-medium">
                          {field.key === "default" ? "Default Signature" : field.name}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" type="button" onClick={() => setValue("selectedSignatureIndex", index)}>
                          {selectedSignatureIndex === index ? "Selected" : "Select"}
                        </Button>
                        {fields.length > 1 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            type="button"
                            onClick={() => handleRemoveSignature(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>}

              </CardContent>
            </Card>

            {/* Signature Editor */}
            <Card className="col-span-8 w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Signature Editor</CardTitle>
                    <CardDescription>Customize your signature</CardDescription>
                  </div>
                  <div className="flex">
                    <Pencil
                      onClick={() => setType("canvas")}
                      className={`mr-2 h-8 w-8 p-2 rounded-full cursor-pointer ${type === "canvas" ? "bg-blue-600 text-white" : "bg-gray-600"}`}
                    />
                    <Upload
                      onClick={() => setType("upload")}
                      className={`mr-2 h-8 w-8 p-2 rounded-full cursor-pointer ${type === "upload" ? "bg-blue-600 text-white" : "bg-gray-600"}`}
                    />
                    <FileText
                      onClick={() => setType("editor")}
                      className={`mr-2 h-8 w-8 p-2 rounded-full cursor-pointer ${type === "editor" ? "bg-blue-600 text-white" : "bg-gray-600"}`}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 w-full">
                <div>
                  <Label htmlFor="signatureName">Signature Name</Label>
                  <Input
                    id="signatureName"
                    {...register(`signatures.${selectedSignatureIndex}.name`)}
                  />
                </div>

                {type === "canvas" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Draw Signature</h3>
                    <SignatureCanvas
                      onSave={(signatureData) =>
                        update(selectedSignatureIndex, {
                          ...selectedSignature,
                          line: signatureData,
                          type: "blob"
                        })
                      }
                    />
                  </div>
                )}

                {type === "editor" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Rich Text Editor</h3>
                    <SignatureEditor
                      value={selectedSignature?.line || ""}
                      onChange={(value) =>
                        update(selectedSignatureIndex, {
                          ...selectedSignature,
                          line: value,
                          type: "text"
                        })
                      }
                    />
                  </div>
                )}

                {type === "upload" && (
                  <div>
                    <Label htmlFor="uploadSignature">Upload Signature</Label>
                    <Label
                      htmlFor="uploadSignature"
                      className="flex items-center justify-center w-full h-32 px-4 transition border-2 border-gray-600 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none bg-gray-800"
                    >
                      <span className="flex items-center space-x-2">
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="font-medium text-gray-400">
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
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit">Save Signatures</Button>
            </div>
          </div>
        </form>
      </div>
    </div>

  )
}

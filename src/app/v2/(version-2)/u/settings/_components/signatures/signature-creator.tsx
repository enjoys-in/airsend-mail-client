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
import { Plus, Trash2, Upload, Check, Edit, Eye, Pencil, FileText } from "lucide-react"
import { useSettingsStore, useSignatureEditorStore } from "@/store/settings"
import { airsendDB } from "@/db"
import { API } from "@/lib/api/handler"
import { toast } from "sonner"

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

export function SignatureCreator({ selectedAccount }: { selectedAccount: any }) {
  const { type } = useSignatureEditorStore()
  const { settings } = useSettingsStore()

  const { control, register, handleSubmit, watch, setValue, getValues } = useForm<SignatureFormValues>({
    defaultValues: {
      signatures: [
        {
          key: "default",
          line: "Your Signature",
          type: "text",
          name: "Default",
          default: true
        }
      ],
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

    if (!selectedAccount?.email) return toast.error("Please select an account")
    const res = await airsendDB.updateNestedItem("settings", selectedAccount?.email as string, "settings.signatures", data.signatures as any)
    if (res.success) {
      setValue("signatures", res.newValue as any)
      setValue("selectedSignatureIndex", res.newValue?.findIndex((s: any) => s.default) || selectedSignatureIndex || 0)
    }
  }

  const handleAddSignature = () => {
    append({
      key: `signature-${fields.length + 1}`,
      line: "",
      type: "text",
      name: `Signature ${fields.length + 1}`,
      default: false
    })
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
    if (!selectedAccount?.email) return

    async function loadSignatures() {

      if (settings?.signatures) {
        setValue("selectedSignatureIndex", settings.signatures.findIndex((s: any) => s.default) || 0)

        return setValue("signatures", settings.signatures as any)
      }
      const idbData = await airsendDB.getNestedItem(
        "settings",
        selectedAccount.email as string,
        "settings.signatures"
      )

      if (idbData.success && idbData?.value && idbData?.value.length > 0) {

        setValue("signatures", idbData.value as any)
        setValue("selectedSignatureIndex", idbData?.value.findIndex((s: any) => s.default) || 0)
      } else {
        // const { data } = await API.handleGetMailUserSetting(`${idbData?.path}&=email=${selectedAccount?.email}`)
        // if (data.success) {
        //   setValue("signatures", data.result)
        //   setValue("selectedSignatureIndex", data.result.findIndex((s: any) => s.default) || 0)
        //   await airsendDB.updateNestedItem(
        //     "settings",
        //     selectedAccount.email as string,
        //     "settings.signatures",
        //     data.result
        //   )
        // }
      }
    }

    loadSignatures()

  }, [selectedAccount?.email])

  return (
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
                        onClick={() => remove(index)}
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
              {/* <div className="flex">
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
              </div> */}
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
                  className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500"
                >
                  <span className="flex items-center space-x-2">
                    <Upload className="flex flex-col sm:flex-row items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:hover:border-gray-500"
                    />
                    <span className="font-medium text-gray-600 dark:text-gray-400">
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
  )
}

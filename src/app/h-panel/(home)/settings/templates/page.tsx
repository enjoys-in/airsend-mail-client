"use client"
import { useState, useCallback } from "react"
import Image from "next/image"
import { Check, Edit2, Upload, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { PageHeader, Section } from "@/components/h-panel/kit"

const templates = [
  { id: 1, name: "Classic", layout: ["img", "title", "description"] },
  { id: 2, name: "Modern", layout: ["title", "img", "description"] },
  { id: 3, name: "Minimal", layout: ["title", "description"] },
  { id: 4, name: "Split", layout: [["title", "img"], "description"] },
  { id: 5, name: "Zigzag", layout: ["title", ["img", "description"]] },
  { id: 6, name: "Banner", layout: ["img", ["title", "description"]] },
  { id: 7, name: "Compact", layout: [["title", "description"], "img"] },
]

export default function MailGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("/placeholder.svg")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const generateEmailHTML = useCallback(() => {
    const renderContent = (item: string | string[]): string => {
      if (Array.isArray(item)) {
        const text = `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
          <tr>
            ${item
            .map(
              (subItem) => `<td width="${100 / item.length}%" style="vertical-align: top; padding: 0 10px;">
              ${renderContent(subItem)}
            </td>`,
            )
            .join("")}
          </tr>
        </table>`
        return text
      }
      switch (item) {
        case "img":
          return `<img src="${image}" alt="Email image" style="width: 100%; max-width: 600px; height: auto; margin-bottom: 20px;">`
        case "title":
          return `<h1 style="color: #2c3e50; font-size: 24px; margin-bottom: 20px;">${title}</h1>`
        case "description":
          return `<p style="margin-bottom: 20px;">${description}</p>`
        default:
          return ""
      }
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        img { max-width: 100%; height: auto; }
        h1 { color: #2c3e50; }
        p { margin-bottom: 20px; }
    </style>
</head>
<body>
    ${selectedTemplate.layout.map(renderContent).join("\n    ")}
</body>
</html>
    `.trim()
  }, [selectedTemplate, title, description, image])

  const copyEmailHTML = () => {
    navigator.clipboard.writeText(generateEmailHTML())
    toast({
      title: "Copied!",
      description: "Email HTML has been copied to clipboard.",
    })
  }

  const renderTemplatePreview = (layout: (string | string[])[]) => {
    return layout.map((item, index) => {
      if (Array.isArray(item)) {
        return (
          <div key={index} className="flex space-x-2">
            {item.map((subItem, subIndex) => (
              <div key={subIndex} className="flex-1">
                {renderTemplatePreview([subItem])}
              </div>
            ))}
          </div>
        )
      }
      switch (item) {
        case "img":
          return <div key={index} className="mb-2 h-12 rounded bg-muted-foreground/20" />
        case "title":
          return <div key={index} className="mb-2 h-4 w-3/4 rounded bg-muted-foreground/25" />
        case "description":
          return (
            <div key={index} className="space-y-1 mb-2">
              <div className="h-2 w-full rounded bg-muted-foreground/20" />
              <div className="h-2 w-5/6 rounded bg-muted-foreground/20" />
              <div className="h-2 w-4/6 rounded bg-muted-foreground/20" />
            </div>
          )
        default:
          return null
      }
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email templates"
        description="Pick a layout, fill in the content and copy the generated HTML."
        actions={
          <Button onClick={copyEmailHTML} className="gap-2">
            <Copy className="h-4 w-4" /> Copy email HTML
          </Button>
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Section title="Choose a template" description="Seven starting layouts.">
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <button
                type="button"
                key={template.id}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  selectedTemplate.id === template.id
                    ? "border-foreground/60 bg-muted/60"
                    : "border-border/70 hover:border-foreground/30 hover:bg-muted/40"
                )}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="mb-2 text-xs font-medium text-muted-foreground">{template.name}</div>
                {renderTemplatePreview(template.layout)}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Email preview" description="Click a block to edit it.">
          <div className="mx-auto max-w-2xl space-y-5">
            {selectedTemplate.layout.map((item, index) => {
              if (Array.isArray(item)) {
                return (
                  <div key={index} className="flex gap-4">
                    {item.map((subItem, subIndex) => (
                      <div key={subIndex} className="flex-1">
                        {renderContentEditable(subItem)}
                      </div>
                    ))}
                  </div>
                )
              }
              return renderContentEditable(item, index)
            })}
          </div>
        </Section>
      </div>
    </div>
  )

  function renderContentEditable(item: string, key?: number) {
    switch (item) {
      case "img":
        return <ImageUpload key={key} image={image} onUpload={handleImageUpload} />
      case "title":
        return <EditableField key={key} value={title} onChange={setTitle} placeholder="Enter title" />
      case "description":
        return (
          <EditableField
            key={key}
            value={description}
            onChange={setDescription}
            placeholder="Enter description"
            isTextarea
          />
        )
      default:
        return null
    }
  }
}

interface EditableFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  isTextarea?: boolean
}

function EditableField({ value, onChange, placeholder, isTextarea = false }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    setIsEditing(false)
  }

  return (
    <div className="relative group">
      {isEditing ? (
        <div className="flex items-center">
          {isTextarea ? (
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full"
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full"
            />
          )}
          <Button onClick={handleSave} size="icon" variant="ghost" className="ml-2">
            <Check className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="min-h-[2.5rem] rounded-md border border-dashed border-border/70 p-2 transition-colors hover:bg-muted/50">
          {value ? (
            isTextarea ? (
              <p className="whitespace-pre-wrap">{value}</p>
            ) : (
              <h3 className="text-lg font-medium">{value}</h3>
            )
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
      )}
      {!isEditing && (
        <Button
          onClick={() => setIsEditing(true)}
          size="icon"
          variant="ghost"
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

interface ImageUploadProps {
  image: string
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function ImageUpload({ image, onUpload }: ImageUploadProps) {
  return (
    <div className="relative group">
      <Image
        src={image || "/placeholder.svg"}
        alt="Template image"
        width={800}
        height={400}
        className="h-[200px] w-full rounded-md border border-border/70 object-cover"
      />
      <label
        htmlFor="image-upload"
        className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-md bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Upload className="h-8 w-8 text-white" />
      </label>
      <input id="image-upload" type="file" accept="image/*" onChange={onUpload} className="hidden" />
    </div>
  )
}


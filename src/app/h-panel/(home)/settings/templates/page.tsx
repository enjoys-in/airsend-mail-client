"use client"
import { useState, useCallback } from "react"
import Image from "next/image"
import { Check, Edit2, Upload, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

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
          return <div key={index} className="h-16 bg-gray-200 rounded-md mb-2" />
        case "title":
          return <div key={index} className="h-6 bg-gray-200 rounded-md w-3/4 mb-2" />
        case "description":
          return (
            <div key={index} className="space-y-1 mb-2">
              <div className="h-4 bg-gray-200 rounded-md w-full" />
              <div className="h-4 bg-gray-200 rounded-md w-5/6" />
              <div className="h-4 bg-gray-200 rounded-md w-4/6" />
            </div>
          )
        default:
          return null
      }
    })
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gray-100 dark:bg-accent p-6 overflow-y-auto  " style={{ maxHeight: "calc(100vh - 4rem)" }}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Choose Template</h2>
            <div className="grid grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedTemplate.id === template.id
                    ? "border-blue-500 shadow-md"
                    : "border-gray-200 hover:border-blue-300"
                    }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-100">{template.name}</div>
                  {renderTemplatePreview(template.layout)}
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-2/3 p-6 bg-accent dark:bg-black">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 ">Email Preview</h2>
            <div className="space-y-6 max-w-2xl mx-auto">
              {selectedTemplate.layout.map((item, index) => {
                if (Array.isArray(item)) {
                  return (
                    <div key={index} className="flex space-x-4">
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
            <div className="mt-8 text-center">
              <Button onClick={copyEmailHTML} className="bg-blue-500 hover:bg-blue-600 text-gray-800 dark:text-gray-100 dark:bg-accent rounded-e-none">
                <Copy className="mr-2 h-4 w-4" /> Copy Email HTML
              </Button>
            </div>
          </div>
        </div>
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
        <div className="min-h-[2.5rem] p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
          {value ? (
            isTextarea ? (
              <p className="whitespace-pre-wrap">{value}</p>
            ) : (
              <h3 className="text-lg font-semibold">{value}</h3>
            )
          ) : (
            <span className="text-gray-400">{placeholder}</span>
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
        className="w-full h-[200px] object-cover rounded-md"
      />
      <label
        htmlFor="image-upload"
        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-md"
      >
        <Upload className="h-8 w-8 text-white" />
      </label>
      <input id="image-upload" type="file" accept="image/*" onChange={onUpload} className="hidden" />
    </div>
  )
}


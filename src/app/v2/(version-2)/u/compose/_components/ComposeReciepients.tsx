"use client"

import type React from "react"
import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ProfileCardComponent from "./ProfileCardComponent"
import { toast } from "sonner"

type ComposeRecipientsProps = {
  type: "to" | "cc" | "bcc"
  removeRecipient: (type: "to" | "cc" | "bcc", value: string) => void
  addRecipient: (type: "to" | "cc" | "bcc", value: string) => void
  recipients: { id: string; name?: string; email: string; color: string }[]
}

export default function ComposeRecipients({
  type,
  addRecipient,
  removeRecipient,
  recipients,
}: ComposeRecipientsProps) {

  const [inputValue, setInputValue] = useState("")

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  const getRandomColor = (email: string) => {
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500",
      "bg-teal-500", "bg-cyan-500"
    ]
    const index = email
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  const getInitial = (email: string) => email.charAt(0).toUpperCase()

  const addTag = (value: string) => {
    const trimmedValue = value.trim()
    if (trimmedValue && recipients.every((recipient) => recipient.email !== trimmedValue) && isValidEmail(trimmedValue)) {

      if (!isValidEmail(trimmedValue)) return toast.error("Invalid email");
      addRecipient(type, trimmedValue)  
      setInputValue("")
    }
  }

  const removeTag = (tagToRemove: string) => removeRecipient(type, tagToRemove)

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      let value = "";

      if (type === "to") value = inputValue.trim().replace(",", "");
      else if (type === "cc") value = inputValue.trim().replace(",", "");
      else if (type === "bcc") value = inputValue.trim().replace(",", "");

      if (!isValidEmail(value)) return toast.error("Invalid email");

      // addRecipient(type, value);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (value.includes(",") || value.includes(" ")) {
      const parts = value.split(/[, ]+/).filter((part) => part.trim())
      parts.forEach((part) => addTag(part))
    } else {
      setInputValue(value)
    }
  }

  const handleBlur = () => {
    const trimmed = inputValue.trim()
    if (trimmed) {
      addTag(trimmed)
    }
  }

  return (
    <div className="space-y-2 flex flex-col">
      <div className="max-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-0 focus-within:none focus-within:ring-offset-0">
        <div className="flex flex-wrap gap-1 items-center">
          {recipients.map((tag, index) => (

            <Badge
              key={index}
              variant={isValidEmail(tag.email) ? "secondary" : "destructive"}
              className="flex items-center gap-2 px-2 py-00 h-6"
            >
              <ProfileCardComponent>


                <Avatar className={`h-4 w-4 rounded-md ${getRandomColor(tag.email)}`}>
                  <AvatarFallback
                    className={`h-4 w-4 rounded-md text-xs font-medium text-white ${getRandomColor(tag.email)}`}
                  >
                    {getInitial(tag.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{tag.email}</span>
              </ProfileCardComponent>
              <button
                type="button"
                onClick={() => removeTag(tag.email)}
                className="ml-1 hover:bg-background/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            id="email-input"
            type="text"
            value={inputValue}
            onBlur={handleBlur}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={recipients.length === 0 ? "Add recipients" : ""}
            className="flex-1 min-w-[120px] border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
          />
        </div>
      </div>
    </div>
  )
}

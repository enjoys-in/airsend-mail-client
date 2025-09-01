import React from 'react'
import {
  File,
  FileText,
  FileImage,
  Archive,
  Mail,
  FileIcon,
  Trash2,
  X,
} from "lucide-react"
import { AttachmentWithProgress } from './htmlEditor'

// ⬇️ import shadcn tooltip
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatBytes } from '@/lib/utils'

const AttachmentCard = ({
  attachments,
  removeAttachment,
  cancelUpload
}: {
  removeAttachment: (id: string) => void
  attachments: AttachmentWithProgress[]
  cancelUpload: (id: string) => void
}) => {
  return (
    <div className="border-t p-2 bg-muted/30">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-48 overflow-y-auto">
        {attachments.map((attachment) => {
          const extension = attachment.file.name.split(".").pop()?.toLowerCase()
          let Icon = FileIcon
          switch (extension) {
            case "pdf":
              Icon = File
              break
            case "doc":
            case "docx":
            case "xls":
            case "xlsx":
              Icon = FileText
              break
            case "zip":
            case "rar":
              Icon = Archive
              break
            case "eml":
              Icon = Mail
              break
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
              Icon = FileImage
              break
          }

          return (
            <div
              key={attachment.id}
              className="group relative flex flex-col items-center p-2 bg-neutral-900 rounded border w-28"
            >
              {/* Icon with circular progress */}
              <div className="relative w-10 h-10 flex items-center justify-center">
                {attachment.progress < 100 ? (
                  <>
                    {/* Background Circle */}
                    <svg
                      className="absolute inset-0 w-10 h-10"
                      viewBox="0 0 36 36"
                    >
                      <path
                        className="text-muted stroke-current"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-orange-500 stroke-current"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${attachment.progress}, 100`}
                        strokeLinecap="round"
                        d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>

                    {/* X button centered */}
                    <button
                      type="button"
                      onClick={() => cancelUpload(attachment.id)}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <X className="w-5 h-5 text-muted-foreground hover:text-red-500" />
                    </button>
                  </>
                ) : (
                  <Icon className="w-8 h-8 text-orange-500" />
                )}
              </div>


              {/* File name with Tooltip */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="mt-1 text-xs font-medium truncate w-full text-center cursor-default">
                      {attachment.file.name}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs break-words">
                    {attachment.file.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Size or % */}
              <p className="text-[10px] text-muted-foreground text-center">
                {attachment.progress < 100
                  ? `${Math.round(attachment.progress)}%`
                  :  formatBytes(attachment.file.size)}
              </p>

              {/* Hover delete button */}
              <button
                onClick={() => removeAttachment(attachment.id)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AttachmentCard

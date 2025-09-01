import React from 'react'
import { FileText, Download, FileImage, Share2, Info } from 'lucide-react'
import { FaFilePdf } from 'react-icons/fa'
import type { FileAttachmentInterface } from '@/lib/types/mail.interface'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

const FileAttachment = ({
    attachments,
    messageId,
}: {
    attachments: FileAttachmentInterface[]
    messageId: string
}) => {
    const { toast } = useToast()

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase()
        switch (ext) {
            case 'pdf':
                return <FaFilePdf className="w-6 h-6 text-red-600" />
            case 'txt':
                return <FileText className="w-6 h-6 text-gray-300" />
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <FileImage className="w-6 h-6 text-blue-500" />
            default:
                return <FileText className="w-6 h-6 text-gray-300" />
        }
    }

    const handlePreview = (index: number) => {
        const attachment = attachments[index]
        const arrayBuffer =
            attachment.content instanceof ArrayBuffer
                ? attachment.content
                : new Uint8Array(attachment.content).buffer
        const blob = new Blob([arrayBuffer], { type: attachment.mimeType })
        return URL.createObjectURL(blob)
    }

    const handleDownload = (index: number) => {
        const attachment = attachments[index]
        const arrayBuffer =
            attachment.content instanceof ArrayBuffer
                ? attachment.content
                : new Uint8Array(attachment.content).buffer
        const blob = new Blob([arrayBuffer], { type: attachment.mimeType })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = attachment.filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-4 p-4">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                    {attachments.length} attachment{attachments.length > 1 ? 's' : ''}
                </span>
                <span aria-hidden="true">•</span>
                <span>Scanned by Airsend</span>
                <Info aria-hidden="true" className="size-4 text-muted-foreground" />
            </div>

            {/* Attachments Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {attachments.map((attachment, index) => (
                    <div
                        key={attachment.filename}
                        className="relative group overflow-hidden rounded-md border border-border bg-transparent shadow-sm"
                    >
                        {/* Media Preview */}
                        {attachment.mimeType.startsWith("image/") ? (
                            <img
                                src={handlePreview(index)}
                                alt={attachment.filename}
                                className="h-40 w-full object-cover"
                            />
                        ) : (
                            <div className="h-40 w-full flex items-center justify-center bg-muted">
                                {getFileIcon(attachment.filename)}
                            </div>
                        )}

                        {/* Overlay Info & Actions (visible on hover) */}
                        <div
                            className="
          absolute inset-0 
          bg-black/60 text-white 
          opacity-0 group-hover:opacity-100 
          transition-opacity duration-300
          flex flex-col justify-between
        "
                        >
                            {/* File Info */}
                            <div className="p-3">
                                <div className="truncate text-sm font-medium">{attachment.filename}</div>
                                <div className="text-xs text-gray-300">{attachment.mimeType}</div>
                            </div>

                            {/* Actions */}
                            <div className="p-3 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleDownload(index)}
                                    className={cn(
                                        'inline-flex items-center justify-center',
                                        'rounded-md bg-primary text-primary-foreground',
                                        'px-3 py-2 text-sm font-medium',
                                        'hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                    )}
                                >
                                    <Download className="size-5" aria-hidden="true" />
                                </button>
                                <div className="ml-auto flex items-center gap-2">
                                    <IconButton label="Share">
                                        <Share2 className="size-5" aria-hidden="true" />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}

function IconButton({
    label,
    className,
    children,
    onClick,
}: {
    label: string
    className?: string
    children: React.ReactNode
    onClick?: () => void
}) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className={cn(
                'inline-flex items-center justify-center rounded-md bg-muted text-foreground/90',
                'border border-border shadow-sm',
                'size-10 hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                className
            )}
        >
            {children}
        </button>
    )
}

export default FileAttachment

"use client"
import { useTheme } from "next-themes"

interface SignaturePreviewProps {
  signature: {
    key: string
    line: string
  }
}

export function SignaturePreview({ signature }: SignaturePreviewProps) {
  const { theme } = useTheme()

  if (!signature) {
    return <div className="text-center p-4">No signature selected</div>
  }

  // Check if the signature line is an image (data URL)
  const isImageSignature = signature.line.startsWith("data:image")

  return (
    <div className="p-4 border rounded-md">
      <div className="mb-4 pb-2 border-b">
        <h3 className="font-medium">Email Preview</h3>
      </div>

      <div className="p-4 border rounded-md bg-white dark:bg-gray-800">
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-1">From: your.email@example.com</div>
          <div className="text-sm text-gray-500 mb-1">To: recipient@example.com</div>
          <div className="text-sm text-gray-500 mb-1">Subject: Meeting Follow-up</div>
        </div>

        <div className="mb-6">
          <p>Hello,</p>
          <p className="my-2">Thank you for your time today. I've attached the documents we discussed.</p>
          <p>Best regards,</p>
        </div>

        <div className="pt-4 border-t">
          {isImageSignature ? (
            <img src={signature.line || "/placeholder.svg"} alt="Signature" className="max-h-24 max-w-full" />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: signature.line || "Your Signature" }} className="text-sm" />
          )}

          <div className="mt-2 text-sm">
            <div>Your Name</div>
            <div className="text-gray-500">Your Position</div>
            <div className="text-gray-500">your.email@example.com</div>
            <div className="text-gray-500">+1 (555) 123-4567</div>
          </div>
        </div>
      </div>
    </div>
  )
}

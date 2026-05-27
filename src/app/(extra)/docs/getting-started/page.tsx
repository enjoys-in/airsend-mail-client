import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Suspense } from "react"
import ApiPlayground from "./_components/api-playground"

export default function ApiDocs() {
  return (
    <div className="flex">
      <div className="flex-1 md:p-6 p-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl text-neutral-800 dark:text-gray-200 md:text-3xl font-bold">Authorization</h1>
              <Badge variant="secondary" className="bg-orange-500 text-neutral-500 dark:text-gray-200">Beta</Badge>
            </div>

            <Alert variant={"destructive"}>
              <AlertTitle className="text-orange-500 text-2xl"><strong>Warning</strong></AlertTitle>
              <AlertDescription className="text-neutral-800 dark:text-gray-400 text-sm font-sans">
                <ul className="list-disc px-4">
                  <li>At some point the API may fail.</li>
                  <li>Rate Limit may apply (for <code>Get Mails</code>, its 10/minute, for <code>Sending Mails</code>, its 3/minute)</li>
                  <li>Use Socket for Realtime Updates/Receiving Mails</li>
                  <li>This feature is in beta and may not be stable. Use at your own risk.</li>
                  <li>To prevent further damage, do not share your API credentials with anyone.</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          {/* Interactive API playground — client component island */}
          <Suspense fallback={
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-muted rounded w-full" />
              <div className="h-10 bg-muted rounded w-full" />
              <div className="h-64 bg-muted rounded w-full" />
            </div>
          }>
            <ApiPlayground />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
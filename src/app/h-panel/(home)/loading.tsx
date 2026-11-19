import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

/** Shown while any h-panel page loads: quiet placeholders instead of a full-screen spinner. */
const loading = () => {
  return (
    <div className="w-full space-y-6 px-4 py-5">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[84px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

export default loading

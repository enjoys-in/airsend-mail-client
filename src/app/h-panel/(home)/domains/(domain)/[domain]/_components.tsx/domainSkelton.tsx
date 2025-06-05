import React from 'react'

const DomainSkelton = () => {
  return (
    <div className={` p-4 md:p-6`}>
      <div className="mx-auto max-w-6xl space-y-6 bg-background text-foreground">
        <div className="p-6  space-y-6 bg-transparent text-white">
          {/* Domain Info Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="w-40 h-8 bg-stone-700 rounded animate-pulse" />
              <div className="mt-2 sm:mt-0 w-28 h-8 bg-stone-700 rounded animate-pulse" />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="w-40 h-6 bg-stone-700 rounded animate-pulse" />
              <div className="mt-2 sm:mt-0 w-28 h-6 bg-stone-700 rounded animate-pulse" />
            </div>
          </div>
          {/* DNS Records Section */}
          <div>
            <div className="h-6 w-48 bg-stone-700 rounded animate-pulse mb-4" />
            <div className="flex flex-col gap-5">
              {/* DKIM and SPF Record Skeleton */}
              <div className="p-4 bg-stone-800 rounded-lg space-y-4">
                <div className="h-5 w-24 bg-slate-800 rounded animate-pulse" />
                <div className="space-y-2">
                  {/* Record Rows */}
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div className="flex justify-between items-center" key={index}>
                      <div className="w-16 h-8 bg-stone-700 rounded animate-pulse" />
                      <div className="w-40 h-8 bg-stone-700 rounded animate-pulse" />
                      <div className="w-12 h-8 bg-stone-700 rounded animate-pulse" />
                      <div className="w-12 h-8 bg-stone-700 rounded animate-pulse" />
                    </div>
                  ))}

                </div>
              </div>
              {/* DMARC Record Skeleton */}
              <div className="p-4 bg-stone-800 rounded-lg space-y-4">
                <div className="h-5 w-24 bg-slate-800 rounded animate-pulse" />
                {Array.from({ length: 2 }).map((_, index) => (
                  <div className="flex justify-between items-center" key={index}>
                    <div className="w-16 h-8 bg-stone-700 rounded animate-pulse" />
                    <div className="w-40 h-8 bg-stone-700 rounded animate-pulse" />
                    <div className="w-12 h-8 bg-stone-700 rounded animate-pulse" />
                    <div className="w-12 h-8 bg-stone-700 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Verify Button Skeleton */}
          <div className="flex justify-end">
            <div className="w-36 h-10 bg-stone-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DomainSkelton
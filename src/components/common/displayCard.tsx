import React from 'react'
import Link from 'next/link'
const DisplayLeftSidebarCard = () => {
  return (
    <div className="space-y-1">
      <div className="mt-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900" role="alert">
        <div className="flex items-center mb-3">
          <span className="bg-orange-100 text-orange-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-orange-200 dark:text-orange-900">Beta</span>
        </div>
        <p className="mb-3 text-sm text-blue-800 dark:text-blue-400">
          All Features are in Beta mode.
        </p>
        <Link className="text-sm text-blue-800 underline font-medium hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" href="/h-panel">Get Full Access</Link>
      </div>
    </div>
  )
}

export default DisplayLeftSidebarCard
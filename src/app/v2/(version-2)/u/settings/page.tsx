import React from 'react'
import { DisplayTabComponent } from './_components/displayTabComponent'

const SettingsPage = async () => {
  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 transition-all">
      <div className="mx-auto w-full max-w-4xl">
        <DisplayTabComponent />
      </div>
    </div>
  )
}

export default SettingsPage

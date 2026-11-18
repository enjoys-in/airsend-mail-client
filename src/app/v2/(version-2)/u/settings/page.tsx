import React from 'react'
import { DisplayTabComponent } from './_components/displayTabComponent'

const SettingsPage = async () => {
  return (
    <div className="flex-1 min-h-0 px-3 pb-8 sm:px-6 sm:pb-10 md:px-8 md:pb-12 pt-0 transition-all">
      <div className="mx-auto w-full max-w-4xl">
        <DisplayTabComponent />
      </div>
    </div>
  )
}

export default SettingsPage

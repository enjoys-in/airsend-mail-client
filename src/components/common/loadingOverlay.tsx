import React from 'react'
import { Icons } from '../icons'

const LoadingOverlay = ({ text = "Please Wait..." }: { text?: string }) => {
  return (
    <div className="absolute bg-gray-800 bg-opacity-60 z-[9999] h-full w-full flex items-center justify-center">
      <div className="flex items-center">
        <span className="text-3xl mr-4">{text}</span>
        <Icons.bold /> 
      </div>
    </div>

  )
}

export default LoadingOverlay
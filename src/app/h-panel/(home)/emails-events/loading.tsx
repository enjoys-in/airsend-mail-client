import React from 'react'

const loading = () => {
  return (
    <div className="flex items-center justify-center h-full w-full min-h-[50vh]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-600 border-t-transparent" />
    </div>
  )
}

export default loading
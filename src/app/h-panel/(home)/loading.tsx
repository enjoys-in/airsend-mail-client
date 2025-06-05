import React from 'react'

const loading = () => {
  return (
    <div className="fixed inset-0  flex items-center justify-center bg-black opacity-70">
     <div
        className={`h-20 w-20 animate-spin rounded-full border-4 border-rose-600 border-t-transparent`}
      ></div>
  </div>
  )
}

export default loading
import React from 'react'

const loading = () => {
  return (
    <div className="fixed  flex items-center justify-center  ">
     <div
        className={`h-28 w-28 animate-spin rounded-full border-4 border-rose-600 border-t-transparent`}
      ></div>
  </div>
  )
}

export default loading
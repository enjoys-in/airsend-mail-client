import React from 'react'
import { DisplayTabComponent } from './_components/displayTabComponent'


const page = async() => {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <DisplayTabComponent />
    </div>
  )
}

export default page
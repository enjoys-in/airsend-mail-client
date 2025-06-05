import React from 'react'
import { RelayForm } from './_components/RelayForm'
import RelayTable from './_components/RelayTable'

const page = () => {
  return (
    <div>
      <RelayTable />
      <RelayForm />
    </div>
  )
}

export default page
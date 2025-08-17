import React from 'react'
import { SignatureCreator } from './signature-creator'

const DisplaySignature = ({ email }: { email: string }) => {
  return (<SignatureCreator email={email} />

  )
}

export default DisplaySignature
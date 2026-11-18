"use client"

import MyAddresses from "./myAddresses"

export default function IdentitySection({ email }: { email: string }) {
  return (
    <div className="w-full">
      <MyAddresses />
    </div>
  )
}

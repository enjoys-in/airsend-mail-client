import Image from 'next/image'
import React from 'react'

export const LogoImage = ({ w = 256 }: { w?: number }) => {
  return (
    <div>
      <Image priority className="logo hidden dark:block" src="/navbar-logo.png" alt="logo" width={w} height={w} style={{ width: "auto", height: "auto" }} />
      <Image priority className="logo dark:hidden" src="/navbar-logo-light.png" alt="logo" width={w} height={w} style={{ width: "auto", height: "auto" }} />
    </div>
  )
}

export const FavIcon = ({ w = 32 }: { w?: number }) => {
  return (
    <Image
      src="/favicon.png"
      alt="logo"
      priority
      width={w}
      height={w}
    />
  )
}
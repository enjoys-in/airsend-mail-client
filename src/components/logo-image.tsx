import Image from 'next/image'
import React from 'react'

export const LogoImage = ({w=256}:{w?:number}) => {
  return (
    <div>
      <Image className="logo hidden dark:block" src="/navbar-logo.png" alt="logo" width={w} height={w} />
      <Image className="logo dark:hidden" src="/navbar-logo-light.png" alt="logo" width={w} height={w} />
    </div>
  )
}

export const FavIcon = ({w=32}:{w?:number}) => {
  return (
    <Image
      src="/favicon.png"
      alt="logo"
   
      width={w}
      height={w}
    />
  )
}
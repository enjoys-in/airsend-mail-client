"use client"
import React from 'react'
import { cn } from '@/lib/utils'

export const MailList = React.memo(({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn(
      "bg-background transition-all duration-200 ease-out",
      className
    )}>
      {children}
    </div>
  )
})

MailList.displayName = 'MailList'

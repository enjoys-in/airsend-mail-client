"use client"
import React from 'react'
import { useMailStore } from '@/store/mails'
import { cn } from '@/lib/utils'

export const MailList = React.memo(({ children, className }: { children: React.ReactNode; className?: string }) => {
  const hasCheckedItems = useMailStore((state) => state.checkedItems.length > 0)
  return (
    <div className={cn(
      "bg-background transition-all duration-200 ease-out",
      hasCheckedItems && "mt-10",
      className
    )}>
      {children}
    </div>
  )
})

MailList.displayName = 'MailList'

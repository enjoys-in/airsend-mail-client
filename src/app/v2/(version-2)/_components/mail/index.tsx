"use client"
import React from 'react'
import { useMailStore } from '@/store/mails'
import { cn } from '@/lib/utils'

export const MailList = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { checkedItems } = useMailStore()
  return (
    <div className={cn("bg-neutral-200 dark:bg-neutral-900  transition-all duration-300 ease-in-out rounded-2xl", checkedItems.length > 0 && "mt-8", className)}>
      {children}
    </div>
  )
}

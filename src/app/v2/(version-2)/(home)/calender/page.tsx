"use client"
import React from 'react'
import dynamic from 'next/dynamic';
const BigCalendar = dynamic(() => import('./_components/big-calendar'), { ssr: false })
import { SidebarProvider } from '@/components/ui/sidebar'



const CalendarPage = () => {

  return (
    <SidebarProvider>
      <div className="flex flex-1 flex-col gap-4 p-2 pt-0">
        <BigCalendar />
      </div>
    </SidebarProvider>
  )
}

export default CalendarPage
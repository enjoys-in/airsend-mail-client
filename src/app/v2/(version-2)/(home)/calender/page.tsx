"use client"
import React from 'react'
import dynamic from 'next/dynamic';
const BigCalendar = dynamic(() => import('./_components/big-calendar'), { ssr: false })


const CalendarPage = () => {

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <BigCalendar />
    </div>
  )
}

export default CalendarPage
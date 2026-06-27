"use client"
import React from 'react'
import dynamic from 'next/dynamic';
import { useFeatureAccess } from '@/hooks/use-feature-access';
import { CalendarX2, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const BigCalendar = dynamic(() => import('./_components/big-calendar'), { ssr: false })

const CalendarPage = () => {
  const { canAccessCalendar, isLoaded } = useFeatureAccess();

  // Still loading settings — show nothing to avoid flash
  if (!isLoaded) {
    return null;
  }

  // Calendar not enabled — show setup prompt
  if (!canAccessCalendar) {
    return (
      <div className="flex h-[calc(100svh-3.5rem)] md:h-[calc(100svh-3rem)] w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted-foreground/25 bg-muted/10 p-8">
        <CalendarX2 className="h-16 w-16 text-muted-foreground/50" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Calendar is not enabled
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Enable calendar in your settings to start managing events, sync with Apple Calendar, Outlook, Thunderbird, and other CalDAV clients.
          </p>
        </div>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/v2/u/settings#calendar">
            <Settings className="h-4 w-4 mr-2" />
            Go to Calendar Settings
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-[calc(100svh-3.5rem)] md:h-[calc(100svh-3rem)] overflow-hidden">
      <BigCalendar />
    </div>
  )
}

export default CalendarPage
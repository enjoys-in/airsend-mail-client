"use client"
import React from 'react'
import { Button } from "@/components/ui/button";
import { RefreshCw, } from 'lucide-react';
import { CustomEventKey, useCustomEvent } from '@/hooks/use-custom-event';
export const SyncButton = ({ event = CustomEventKey.SyncMail }: { event?: CustomEventKey }) => {
  const { emit } = useCustomEvent(event ?? CustomEventKey.SyncMail);
  return (
    <Button onClick={emit} variant="ghost" size="sm" className="text-white hover:bg-neutral-600 rounded-full">
      <RefreshCw className="w-5 h-5" />
    </Button>
  )
}


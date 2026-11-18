"use client";

import React, { useState, useEffect } from "react";
import { ClosedCaption, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MeetCaptionsOverlayProps {
  onClose: () => void;
}

const SAMPLE_CAPTIONS = [
  { speaker: "Sarah Chen", text: "Let's review the sprint deliverables and make sure our WebRTC signaling server is balanced." },
  { speaker: "Raj Patel", text: "The ICE candidate exchange latency dropped under 40 milliseconds on regional clusters." },
  { speaker: "Alex Chen", text: "Awesome. The Google Meet link integration with meet.airsend.in is now active for all participants." },
  { speaker: "Emily Watson", text: "I've uploaded the new Figma specs into the channel files tab for review." },
];

export default function MeetCaptionsOverlay({ onClose }: MeetCaptionsOverlayProps) {
  const [captionIndex, setCaptionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCaptionIndex((prev) => (prev + 1) % SAMPLE_CAPTIONS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const current = SAMPLE_CAPTIONS[captionIndex];

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 max-w-2xl w-[90%] pointer-events-auto">
      <div className="rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-4 py-3 shadow-2xl flex items-start gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 mt-0.5">
          <ClosedCaption className="size-4" />
        </div>
        <div className="flex-1 text-xs">
          <span className="font-semibold text-blue-400 block mb-0.5">{current.speaker}</span>
          <p className="text-slate-200 leading-relaxed font-sans">{current.text}</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="size-6 text-slate-400 hover:text-white shrink-0 -mr-1"
          title="Turn off captions"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

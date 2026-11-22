"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { Loader2, TriangleAlert, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import AudioLevelMeter from "./AudioLevelMeter";
import PersonAvatar from "./PersonAvatar";

export interface VideoPreviewProps {
  /** The stream to show (the processed one when a background effect is on). */
  stream?: MediaStream | null;
  /** Use instead of `stream` when something else already sets `srcObject` on the element (the call hook does). */
  videoRef?: React.Ref<HTMLVideoElement>;
  cameraOn: boolean;
  name: string;
  /** Show yourself as in a mirror (default). */
  mirrored?: boolean;
  /** A background effect is being prepared. */
  loading?: boolean;
  loadingLabel?: string;
  /** Small warning chip, e.g. "Background effects are not supported in this browser". */
  notice?: string | null;
  /** Show the live microphone level in the name chip. */
  levelStream?: MediaStream | null;
  micMuted?: boolean;
  /** Overlay content pinned to the bottom centre (the toggle bar). */
  children?: React.ReactNode;
  className?: string;
}

/** The camera preview of the green room: the stream, a name chip with the real mic level, and states for camera off / loading. */
export default function VideoPreview({
  stream,
  videoRef,
  cameraOn,
  name,
  mirrored = true,
  loading = false,
  loadingLabel = "Applying background…",
  notice,
  levelStream,
  micMuted = false,
  children,
  className,
}: VideoPreviewProps) {
  const element = useRef<HTMLVideoElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLVideoElement | null) => {
      element.current = node;
      if (typeof videoRef === "function") videoRef(node);
      else if (videoRef) (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
    },
    [videoRef],
  );

  // Only touch srcObject when a stream is handed in; with `videoRef` the caller owns it.
  useEffect(() => {
    const video = element.current;
    if (!video || stream === undefined) return;
    if (video.srcObject !== stream) video.srcObject = stream;
    if (stream) void video.play().catch(() => {});
  }, [stream]);

  const showVideo = cameraOn && (stream != null || videoRef !== undefined);

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900", className)}>
      {/* Always mounted so its ref stays valid; hidden while the camera is off. */}
      <video
        ref={setRefs}
        autoPlay
        playsInline
        muted
        className={cn("size-full object-cover", showVideo ? "block" : "hidden")}
        style={mirrored ? { transform: "scaleX(-1)" } : undefined}
      />

      {!showVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <PersonAvatar name={name || "You"} className="size-24 border-2 border-slate-700" />
          <span className="text-sm text-slate-400">{cameraOn ? "Waiting for your camera…" : "Your camera is off"}</span>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-[2px]" role="status" aria-live="polite">
          <span className="flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200">
            <Loader2 className="size-3.5 animate-spin" />
            {loadingLabel}
          </span>
        </div>
      )}

      <div className="absolute left-3 top-3 flex max-w-[70%] items-center gap-2 rounded-full bg-slate-950/70 px-3 py-1 backdrop-blur">
        <span className="truncate text-xs text-slate-100">{name || "You"}</span>
        {micMuted ? (
          <MicOff className="size-3.5 shrink-0 text-red-400" aria-label="Muted" />
        ) : (
          levelStream !== undefined && <AudioLevelMeter stream={levelStream} />
        )}
      </div>

      {notice && (
        <div className="absolute right-3 top-3 flex max-w-[60%] items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] text-amber-200 backdrop-blur">
          <TriangleAlert className="size-3.5 shrink-0" />
          <span className="truncate">{notice}</span>
        </div>
      )}

      {children && <div className="absolute inset-x-0 bottom-3 flex justify-center px-3">{children}</div>}
    </div>
  );
}

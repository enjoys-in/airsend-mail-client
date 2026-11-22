"use client";

import { useCallback, useEffect, useState } from "react";

export interface MediaDeviceLists {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  /** Browsers only reveal device names after camera / microphone permission has been granted. */
  labelsAvailable: boolean;
  /** `navigator.mediaDevices.enumerateDevices` exists. */
  supported: boolean;
  /** This browser can route audio output to a chosen speaker (`HTMLMediaElement.setSinkId`). */
  canPickSpeaker: boolean;
  refresh: () => void;
}

const EMPTY: Omit<MediaDeviceLists, "refresh"> = {
  cameras: [],
  microphones: [],
  speakers: [],
  labelsAvailable: false,
  supported: false,
  canPickSpeaker: false,
};

/**
 * The cameras, microphones and speakers of this computer, kept current with the browser's `devicechange` event (a headset
 * plugged in shows up at once). Re-reads whenever `refreshKey` changes, e.g. after the user grants permission and the
 * labels become available.
 */
export function useMediaDevices(enabled = true, refreshKey?: unknown): MediaDeviceLists {
  const [state, setState] = useState<Omit<MediaDeviceLists, "refresh">>(EMPTY);

  const read = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const all = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.deviceId !== "");
      setState({
        cameras: all.filter((d) => d.kind === "videoinput"),
        microphones: all.filter((d) => d.kind === "audioinput"),
        speakers: all.filter((d) => d.kind === "audiooutput"),
        labelsAvailable: all.some((d) => d.label !== ""),
        supported: true,
        canPickSpeaker: typeof HTMLMediaElement !== "undefined" && "setSinkId" in HTMLMediaElement.prototype,
      });
    } catch {
      // Leave the previous lists in place; the next devicechange tries again.
    }
  }, []);

  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !navigator.mediaDevices) return;
    void read();
    navigator.mediaDevices.addEventListener?.("devicechange", read);
    return () => navigator.mediaDevices.removeEventListener?.("devicechange", read);
  }, [enabled, read, refreshKey]);

  return { ...state, refresh: () => void read() };
}

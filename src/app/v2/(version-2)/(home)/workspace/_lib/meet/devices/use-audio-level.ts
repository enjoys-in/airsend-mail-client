"use client";

import { useEffect, useState } from "react";

/**
 * The live loudness (0..1) of the microphone in `stream`, measured with a WebAudio AnalyserNode: what the green-room meter
 * shows is what the room would hear. No audio is played or recorded; the context is closed when the stream changes or the
 * component unmounts. Returns 0 when there is no live, enabled audio track (muted, missing or `active` is false).
 */
export function useAudioLevel(stream: MediaStream | null, active = true): number {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    setLevel(0);
    if (!active || !stream || typeof window === "undefined") return;
    if (stream.getAudioTracks().length === 0) return;

    const AudioCtx: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    let ctx: AudioContext;
    let source: MediaStreamAudioSourceNode;
    try {
      ctx = new AudioCtx();
      source = ctx.createMediaStreamSource(stream);
    } catch {
      return;
    }

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.6;
    source.connect(analyser); // not connected to the destination: nothing is played back

    const data = new Uint8Array(analyser.fftSize);
    let raf = 0;
    let last = 0;
    let shown = 0;

    // Browsers start an AudioContext suspended until the page has had a user gesture.
    const resume = () => void ctx.resume().catch(() => {});
    resume();
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 66) return; // ~15 updates a second is plenty for a meter
      last = now;

      const live = stream.getAudioTracks().some((t) => t.readyState === "live" && t.enabled && !t.muted);
      let next = 0;
      if (live) {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        // RMS, lifted a little so normal speech reaches most of the meter
        next = Math.min(1, Math.sqrt(sum / data.length) * 3.2);
      }
      if (Math.abs(next - shown) > 0.03 || (next === 0 && shown !== 0)) {
        shown = next;
        setLevel(next);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
      try {
        source.disconnect();
      } catch {
        /* already disconnected */
      }
      void ctx.close().catch(() => {});
    };
  }, [stream, active]);

  return level;
}

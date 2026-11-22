"use client";

/**
 * useVideoEffects: camera background effects (blur, picture, your own picture) for a MediaStream.
 *
 * Headless usage:
 *
 *   const fx = useVideoEffects({ stream: cameraStream, cameraOn });
 *   previewVideo.srcObject = fx.outputStream;          // what you look at
 *   peerSender.replaceTrack(fx.outputStream.getVideoTracks()[0]);  // what everyone else sees
 *   fx.setMode({ type: "blur", level: "strong" });
 *   fx.setMode({ type: "image", id: fx.backgrounds[0].id });
 *   fx.setMode({ type: "none" });
 *   await fx.addCustomBackground(file);                // throws an Error with a message that is safe to show
 *
 * - mode "none": `outputStream === stream` (nothing runs, nothing is copied).
 * - while an effect is loading, or when it is unsupported / failed, `outputStream` is still the plain camera stream, so there is
 *   never a black picture. Re-read `outputStream` (and re-send the track) whenever it changes: it changes when an effect
 *   becomes ready, when it is switched off, and when `stream` changes. It does NOT change between blur and a picture.
 * - the last mode is remembered in localStorage (`airsend.meet.effect`) and restored on the next visit.
 * - the audio tracks of `outputStream` are the original ones; this hook never stops the camera or the microphone.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BackgroundOption, EffectMode, EffectsStatus } from "../types";
import { EffectsPipeline, type PipelineEffect } from "./pipeline";
import { effectsSupportError, EffectsError } from "./support";
import { getPresetOptions, isPresetId, renderPreset } from "./presets";
import {
  addCustomBackground as storeCustomBackground,
  listCustomBackgrounds,
  loadCustomBackgroundCanvas,
  removeCustomBackground as deleteCustomBackground,
} from "./custom-backgrounds";

export const EFFECT_STORAGE_KEY = "airsend.meet.effect";

export interface UseVideoEffectsOptions {
  /** The raw camera (and microphone) stream, or null while it is not available yet. */
  stream: MediaStream | null;
  /** The camera is switched on. When false the effect stops computing and the sent track is disabled. */
  cameraOn: boolean;
}

export interface UseVideoEffectsResult {
  outputStream: MediaStream | null;
  mode: EffectMode;
  setMode: (mode: EffectMode) => void;
  status: EffectsStatus;
  /** Why the effect is unsupported or failed (safe to show). */
  error?: string;
  /** Built-in presets first, then the user's own pictures. */
  backgrounds: BackgroundOption[];
  addCustomBackground: (file: File) => Promise<BackgroundOption>;
  removeCustomBackground: (id: string) => Promise<void>;
}

const NONE: EffectMode = { type: "none" };

function readStoredMode(): EffectMode {
  try {
    const raw = window.localStorage.getItem(EFFECT_STORAGE_KEY);
    if (!raw) return NONE;
    const value = JSON.parse(raw) as Partial<EffectMode> & Record<string, unknown>;
    if (value.type === "blur" && (value.level === "light" || value.level === "strong")) return { type: "blur", level: value.level };
    if (value.type === "image" && typeof value.id === "string" && value.id) return { type: "image", id: value.id };
  } catch {
    /* unreadable or storage blocked */
  }
  return NONE;
}

function writeStoredMode(mode: EffectMode) {
  try {
    if (mode.type === "none") window.localStorage.removeItem(EFFECT_STORAGE_KEY);
    else window.localStorage.setItem(EFFECT_STORAGE_KEY, JSON.stringify(mode));
  } catch {
    /* storage blocked: the effect still works for this visit */
  }
}

/** The mode as the pipeline understands it. Throws EffectsError when a picture is gone. */
async function resolveEffect(mode: EffectMode): Promise<PipelineEffect> {
  if (mode.type === "blur") return { kind: "blur", level: mode.level };
  if (mode.type === "image") {
    const canvas = isPresetId(mode.id) ? renderPreset(mode.id) : await loadCustomBackgroundCanvas(mode.id);
    if (!canvas) throw new EffectsError("That background is no longer available.");
    return { kind: "image", source: canvas };
  }
  throw new EffectsError("No effect selected.");
}

const messageOf = (error: unknown, fallback: string) => (error instanceof EffectsError ? error.message : fallback);

export function useVideoEffects({ stream, cameraOn }: UseVideoEffectsOptions): UseVideoEffectsResult {
  const [mode, setModeState] = useState<EffectMode>(NONE);
  const [support, setSupport] = useState<string | null | undefined>(undefined); // undefined = not checked yet (SSR)
  const [runtime, setRuntime] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | undefined>();
  const [processed, setProcessed] = useState<MediaStream | null>(null);
  const [presets, setPresets] = useState<BackgroundOption[]>([]);
  const [custom, setCustom] = useState<BackgroundOption[]>([]);
  const [customLoaded, setCustomLoaded] = useState(false);

  const pipelineRef = useRef<EffectsPipeline | null>(null);
  const modeRef = useRef<EffectMode>(mode);
  modeRef.current = mode;
  const active = mode.type !== "none";

  // Client-only setup: browser support, the remembered mode, the built-in thumbnails, the user's pictures.
  useEffect(() => {
    setSupport(effectsSupportError());
    setModeState(readStoredMode());
    setPresets(getPresetOptions());
    let cancelled = false;
    listCustomBackgrounds()
      .then((items) => !cancelled && setCustom(items))
      .catch(() => {
        /* no IndexedDB (private mode): presets and blur still work */
      })
      .finally(() => !cancelled && setCustomLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // A remembered picture that was deleted meanwhile: fall back to no effect.
  useEffect(() => {
    if (!customLoaded || mode.type !== "image" || isPresetId(mode.id)) return;
    if (!custom.some((item) => item.id === mode.id)) setModeState(NONE);
  }, [customLoaded, custom, mode]);

  // One pipeline per (stream, effect on/off). Switching between blur and pictures only swaps its background (next effect).
  useEffect(() => {
    if (!stream || !active || support === undefined) {
      setProcessed(null);
      setRuntime("idle");
      return;
    }
    if (support) {
      setProcessed(null);
      setRuntime("idle");
      return;
    }

    let cancelled = false;
    setRuntime("loading");
    setError(undefined);
    setProcessed(null);

    const pipeline = new EffectsPipeline(stream, {
      onEnded: () => {
        if (cancelled) return;
        setProcessed(null);
        setRuntime("error");
        setError("The camera stopped, so the effect stopped too.");
      },
    });
    pipelineRef.current = pipeline;

    (async () => {
      try {
        pipeline.setEffect(await resolveEffect(modeRef.current));
        if (cancelled) return;
        await pipeline.start();
        if (cancelled) return;
        setProcessed(pipeline.outputStream);
        setRuntime("ready");
      } catch (failure) {
        if (cancelled) return;
        pipeline.stop();
        setProcessed(null);
        setRuntime("error");
        setError(messageOf(failure, "The background effect could not start. Your camera is sent as it is."));
      }
    })();

    return () => {
      cancelled = true;
      pipeline.stop();
      if (pipelineRef.current === pipeline) pipelineRef.current = null;
    };
  }, [stream, active, support]);

  // Mode changes while a pipeline runs: swap the background.
  useEffect(() => {
    const pipeline = pipelineRef.current;
    if (!pipeline || mode.type === "none") return;
    let cancelled = false;
    resolveEffect(mode)
      .then((effect) => !cancelled && pipeline.setEffect(effect))
      .catch((failure) => {
        if (cancelled) return;
        setError(messageOf(failure, "That background could not be applied."));
        setModeState(NONE);
        writeStoredMode(NONE);
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  // Camera on/off.
  useEffect(() => {
    pipelineRef.current?.setPaused(!cameraOn);
  }, [cameraOn, runtime]);

  const setMode = useCallback((next: EffectMode) => {
    setModeState(next);
    setError(undefined);
    writeStoredMode(next);
  }, []);

  const addCustomBackground = useCallback(async (file: File) => {
    const option = await storeCustomBackground(file);
    setCustom((current) => [...current, option]);
    return option;
  }, []);

  const removeCustomBackground = useCallback(async (id: string) => {
    await deleteCustomBackground(id);
    setCustom((current) => current.filter((item) => item.id !== id));
    if (modeRef.current.type === "image" && modeRef.current.id === id) {
      setModeState(NONE);
      writeStoredMode(NONE);
    }
  }, []);

  const backgrounds = useMemo(() => [...presets, ...custom], [presets, custom]);

  let status: EffectsStatus;
  if (!active || !stream) status = "idle";
  else if (support) status = "unsupported";
  else if (support === undefined) status = "loading";
  else status = runtime === "idle" ? "loading" : runtime;

  const outputStream = status === "ready" && processed ? processed : stream;

  return {
    outputStream,
    mode,
    setMode,
    status,
    error: support && active ? support : error,
    backgrounds,
    addCustomBackground,
    removeCustomBackground,
  };
}

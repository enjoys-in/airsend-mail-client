"use client";

import React, { useRef, useState } from "react";
import { Ban, Check, Droplets, ImagePlus, Loader2, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BackgroundOption, EffectMode, EffectsStatus } from "../../../_lib/meet/types";

export interface BackgroundPickerProps {
  mode: EffectMode;
  onModeChange: (mode: EffectMode) => void;
  status: EffectsStatus;
  error?: string;
  /** Built-in presets and the user's own pictures. */
  backgrounds: BackgroundOption[];
  /** Saves a picture and returns it; reject with an Error to show its message. */
  onUpload: (file: File) => Promise<BackgroundOption>;
  onRemove: (id: string) => Promise<void>;
  onClose?: () => void;
  className?: string;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

function sameMode(a: EffectMode, b: EffectMode): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "blur" && b.type === "blur") return a.level === b.level;
  if (a.type === "image" && b.type === "image") return a.id === b.id;
  return true;
}

function Tile({
  selected,
  disabled,
  label,
  onSelect,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  label: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border bg-slate-900 text-slate-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        selected ? "border-blue-500 ring-2 ring-blue-500" : "border-slate-700 hover:border-slate-500",
        disabled && "cursor-not-allowed opacity-40 hover:border-slate-700",
      )}
    >
      {children}
      {selected && (
        <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-blue-600 text-white">
          <Check className="size-3" />
        </span>
      )}
    </button>
  );
}

/** Teams-style "Background filters" panel: none, blur, built-in pictures, and the user's own uploads (drag & drop or browse). */
export default function BackgroundPicker({
  mode,
  onModeChange,
  status,
  error,
  backgrounds,
  onUpload,
  onRemove,
  onClose,
  className,
}: BackgroundPickerProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const unsupported = status === "unsupported";
  const presets = backgrounds.filter((b) => b.kind === "preset");
  const custom = backgrounds.filter((b) => b.kind === "custom");

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setProblem(null);
    if (!ACCEPTED.includes(file.type)) {
      setProblem("Use a JPG, PNG or WebP picture.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setProblem("That picture is larger than 10 MB. Pick a smaller one.");
      return;
    }
    setUploading(true);
    try {
      const saved = await onUpload(file);
      onModeChange({ type: "image", id: saved.id });
    } catch (failure) {
      setProblem(failure instanceof Error ? failure.message : "Could not save that picture.");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    setProblem(null);
    try {
      await onRemove(id);
      if (mode.type === "image" && mode.id === id) onModeChange({ type: "none" });
    } catch (failure) {
      setProblem(failure instanceof Error ? failure.message : "Could not remove that picture.");
    }
  };

  const pick = (next: EffectMode) => () => onModeChange(next);

  return (
    <section aria-label="Background filters" className={cn("flex flex-col gap-4", className)}>
      <header className="flex items-center justify-between">
        <h2 className="text-base font-medium text-white">Background filters</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close background filters"
            className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="size-4" />
          </button>
        )}
      </header>

      {unsupported && (
        <p className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200" role="status">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          Background effects need a newer browser with WebGL. Your camera is sent as it is.
        </p>
      )}
      {status === "loading" && (
        <p className="flex items-center gap-2 text-xs text-slate-400" role="status">
          <Loader2 className="size-3.5 animate-spin" /> Getting effects ready…
        </p>
      )}
      {status === "error" && (
        <p className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300" role="alert">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          {error || "Background effects could not start. Your camera is sent as it is."}
        </p>
      )}

      <div role="radiogroup" aria-label="Background effect" className="grid grid-cols-3 gap-2">
        <Tile label="No effect" selected={sameMode(mode, { type: "none" })} onSelect={pick({ type: "none" })}>
          <Ban className="size-5" />
        </Tile>
        <Tile
          label="Blur (light)"
          disabled={unsupported}
          selected={sameMode(mode, { type: "blur", level: "light" })}
          onSelect={pick({ type: "blur", level: "light" })}
        >
          <span className="flex flex-col items-center gap-1 text-[11px]">
            <Droplets className="size-5" /> Light blur
          </span>
        </Tile>
        <Tile
          label="Blur (strong)"
          disabled={unsupported}
          selected={sameMode(mode, { type: "blur", level: "strong" })}
          onSelect={pick({ type: "blur", level: "strong" })}
        >
          <span className="flex flex-col items-center gap-1 text-[11px]">
            <Droplets className="size-6" /> Strong blur
          </span>
        </Tile>

        {presets.map((bg) => (
          <Tile
            key={bg.id}
            label={bg.label}
            disabled={unsupported}
            selected={mode.type === "image" && mode.id === bg.id}
            onSelect={pick({ type: "image", id: bg.id })}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bg.thumbnail} alt="" className="size-full object-cover" draggable={false} />
          </Tile>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-xs text-slate-400">Your pictures</h3>
        <div className="grid grid-cols-3 gap-2">
          {custom.map((bg) => (
            <div key={bg.id} className="group relative">
              <Tile
                label={bg.label}
                disabled={unsupported}
                selected={mode.type === "image" && mode.id === bg.id}
                onSelect={pick({ type: "image", id: bg.id })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bg.thumbnail} alt="" className="size-full object-cover" draggable={false} />
              </Tile>
              <button
                type="button"
                onClick={() => void remove(bg.id)}
                aria-label={`Remove ${bg.label}`}
                className="absolute left-1 top-1 flex size-5 items-center justify-center rounded-full bg-slate-950/80 text-slate-200 opacity-0 transition hover:bg-red-600 focus-visible:opacity-100 group-hover:opacity-100"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}

          <button
            type="button"
            disabled={unsupported || uploading}
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void upload(e.dataTransfer.files?.[0]);
            }}
            aria-label="Upload your own background"
            className={cn(
              "flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-[11px] text-slate-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40",
              dragOver ? "border-blue-500 bg-blue-500/10 text-blue-200" : "border-slate-600 hover:border-slate-400 hover:text-slate-200",
            )}
          >
            {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            {uploading ? "Saving…" : "Upload"}
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            void upload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <p className="text-[11px] text-slate-500">Drop a JPG, PNG or WebP picture here, or choose one. It stays on this device.</p>
        {problem && (
          <p className="text-xs text-red-300" role="alert">
            {problem}
          </p>
        )}
      </div>
    </section>
  );
}

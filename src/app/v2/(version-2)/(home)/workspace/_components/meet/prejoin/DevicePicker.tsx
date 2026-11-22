"use client";

import React from "react";
import { Camera, Mic, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaDevices } from "../../../_lib/meet/devices/use-media-devices";

export interface DevicePickerProps {
  videoDeviceId?: string;
  audioDeviceId?: string;
  speakerDeviceId?: string;
  /** A picker is only shown when its change handler is given. */
  onVideoDeviceChange?: (deviceId: string) => void;
  onAudioDeviceChange?: (deviceId: string) => void;
  /** Also needs a browser that can route audio output (`setSinkId`). */
  onSpeakerDeviceChange?: (deviceId: string) => void;
  /** Re-read the device list when this changes (e.g. when the camera stream arrives and permission was just granted). */
  refreshKey?: unknown;
  disabled?: boolean;
  className?: string;
}

function DeviceSelect({
  icon: Icon,
  label,
  devices,
  value,
  onChange,
  disabled,
  fallbackLabel,
}: {
  icon: typeof Camera;
  label: string;
  devices: MediaDeviceInfo[];
  value?: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  fallbackLabel: string;
}) {
  const id = `device-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const selected = devices.some((d) => d.deviceId === value) ? value : (devices[0]?.deviceId ?? "");
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs text-slate-300">
        <Icon className="size-3.5 text-slate-400" />
        {label}
      </label>
      <select
        id={id}
        value={selected}
        disabled={disabled || devices.length === 0}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
      >
        {devices.length === 0 && <option value="">{fallbackLabel}</option>}
        {devices.map((d, i) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label || `${label} ${i + 1}`}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Camera, microphone and (where the browser allows) speaker pickers, from the devices this computer really has. */
export default function DevicePicker({
  videoDeviceId,
  audioDeviceId,
  speakerDeviceId,
  onVideoDeviceChange,
  onAudioDeviceChange,
  onSpeakerDeviceChange,
  refreshKey,
  disabled,
  className,
}: DevicePickerProps) {
  const { cameras, microphones, speakers, labelsAvailable, supported, canPickSpeaker } = useMediaDevices(true, refreshKey);

  if (!supported) return null;

  const showSpeaker = !!onSpeakerDeviceChange && canPickSpeaker;
  if (!onVideoDeviceChange && !onAudioDeviceChange && !showSpeaker) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {onVideoDeviceChange && (
        <DeviceSelect
          icon={Camera}
          label="Camera"
          devices={cameras}
          value={videoDeviceId}
          onChange={onVideoDeviceChange}
          disabled={disabled}
          fallbackLabel="No camera found"
        />
      )}
      {onAudioDeviceChange && (
        <DeviceSelect
          icon={Mic}
          label="Microphone"
          devices={microphones}
          value={audioDeviceId}
          onChange={onAudioDeviceChange}
          disabled={disabled}
          fallbackLabel="No microphone found"
        />
      )}
      {showSpeaker && (
        <DeviceSelect
          icon={Volume2}
          label="Speaker"
          devices={speakers}
          value={speakerDeviceId}
          onChange={onSpeakerDeviceChange!}
          disabled={disabled}
          fallbackLabel="Default speaker"
        />
      )}
      {!labelsAvailable && (
        <p className="text-[11px] text-slate-500">Allow camera and microphone access to see your devices by name.</p>
      )}
    </div>
  );
}

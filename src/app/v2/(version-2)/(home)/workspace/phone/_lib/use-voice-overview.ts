"use client";

import { useEffect, useState } from "react";
import { voiceApi } from "./voice-api";
import type { VoiceOverview } from "./types";

let pending: Promise<VoiceOverview | null> | null = null;

function loadOverview(force = false): Promise<VoiceOverview | null> {
  if (!pending || force) {
    pending = voiceApi.me().catch(() => {
      pending = null;
      return null;
    });
  }
  return pending;
}

export function useVoiceOverview(): VoiceOverview | null | undefined {
  const [overview, setOverview] = useState<VoiceOverview | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    loadOverview().then((value) => {
      if (alive) setOverview(value);
    });
    return () => {
      alive = false;
    };
  }, []);

  return overview;
}

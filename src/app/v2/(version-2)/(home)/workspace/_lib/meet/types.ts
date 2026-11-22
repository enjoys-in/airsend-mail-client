// Shared types for the meeting pre-join, background effects, presence and transcription modules.
// New code only: every piece under `_lib/meet/` and `_components/meet/` is reusable and imports these, not each other's internals.

// ── Background effects ───────────────────────────────────────────────────────

/** What the camera feed looks like to everyone else (the processed track is what is sent to the peers). */
export type EffectMode =
  | { type: "none" }
  | { type: "blur"; level: "light" | "strong" }
  /** `id` is a `BackgroundOption.id` (a built-in preset or one of the user's own pictures). */
  | { type: "image"; id: string };

export type EffectsStatus =
  | "idle" // effect is none; the camera stream passes through untouched
  | "loading" // segmentation model is loading
  | "ready" // the processed stream is live
  | "unsupported" // this browser cannot run it (no WebGL / WASM / canvas capture); the camera passes through untouched
  | "error";

export interface BackgroundOption {
  id: string;
  label: string;
  kind: "preset" | "custom";
  /** Small image for the picker (data: or blob: URL). */
  thumbnail: string;
}

// ── Presence (who is in the meeting) ─────────────────────────────────────────

export interface PresenceParticipant {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  isHost: boolean;
  /** This is the signed-in user (only when they have already joined). */
  isSelf: boolean;
  micMuted?: boolean;
  cameraOff?: boolean;
}

export interface MeetingPresence {
  /** First load in flight. */
  loading: boolean;
  /** null = not known yet; false = the room does not exist. */
  exists: boolean | null;
  ended: boolean;
  title?: string;
  /** The person who organises the meeting, when known. */
  organizer: { name: string; email?: string } | null;
  /** Everyone currently in the call (real data only: nobody who has not actually joined). */
  participants: PresenceParticipant[];
  count: number;
  /** Where the roster came from. */
  source: "meeting" | "workspace" | "none";
  error?: string;
  refresh: () => void;
}

// ── Transcription ────────────────────────────────────────────────────────────

export interface TranscriptLine {
  id: string;
  /** Stable id of the speaker (email when known). */
  speakerId: string;
  speaker: string;
  text: string;
  /** ms since epoch */
  at: number;
  /** false while the recogniser is still deciding (interim result). */
  isFinal: boolean;
  isSelf: boolean;
}

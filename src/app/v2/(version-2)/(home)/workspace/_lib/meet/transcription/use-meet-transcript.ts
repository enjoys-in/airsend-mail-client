"use client";

import { useCallback, useMemo } from "react";
import type { LiveCallParticipant } from "../../chat-types";
import type { TranscriptLine } from "../types";
import { useCaptionSync, type ShareStatus } from "./caption-sync";
import { useSpeechTranscription } from "./use-speech-transcription";

// ---------------------------------------------------------------------------
// useMeetTranscript: my live speech-to-text + the other participants' captions, as one transcript.
// One instance per call; pass the result to <CaptionsOverlay> and <TranscriptPanel> so they share a single recogniser.
// ---------------------------------------------------------------------------

export interface UseMeetTranscriptOptions {
  /** Master switch (captions / transcript visible). Nothing is recognised while false. */
  enabled: boolean;
  /** Workspace call id (sharing with others needs a UUID). */
  callId?: string;
  selfEmail: string;
  selfName: string;
  micMuted?: boolean;
  peers?: LiveCallParticipant[];
  /** Overrides the stored/browser language. */
  lang?: string;
}

export interface MeetTranscript {
  /** Final lines (everyone), oldest first, followed by the words still being recognised (isFinal: false). */
  lines: TranscriptLine[];
  /** Final lines only. */
  finalLines: TranscriptLine[];
  supported: boolean;
  unsupportedReason: string | null;
  listening: boolean;
  /** Manually paused with stop(). */
  paused: boolean;
  /** Nothing is recognised because the user's mic is muted. */
  muted: boolean;
  error: string | null;
  lang: string;
  setLang: (lang: string) => void;
  start: () => void;
  stop: () => void;
  /** Empties the transcript on this device. */
  clear: () => void;
  /** Whether my captions reach the other participants. */
  share: ShareStatus;
}

const NO_PEERS: LiveCallParticipant[] = [];

export function useMeetTranscript({
  enabled,
  callId,
  selfEmail,
  selfName,
  micMuted = false,
  peers = NO_PEERS,
  lang,
}: UseMeetTranscriptOptions): MeetTranscript {
  const speech = useSpeechTranscription({ enabled, lang, speakerId: selfEmail, speakerName: selfName || "You", micMuted });
  const sync = useCaptionSync({
    callId,
    selfEmail,
    selfName: selfName || "You",
    peers,
    lines: speech.lines,
    interim: speech.interim,
    enabled,
  });

  const finalLines = useMemo(
    () => [...speech.lines, ...sync.remoteLines].sort((a, b) => a.at - b.at),
    [speech.lines, sync.remoteLines],
  );

  const lines = useMemo(() => {
    const progress: TranscriptLine[] = [...sync.remoteInterim];
    if (speech.interim) {
      progress.push({
        id: "interim:self",
        speakerId: selfEmail,
        speaker: selfName || "You",
        text: speech.interim,
        at: Date.now(),
        isFinal: false,
        isSelf: true,
      });
    }
    progress.sort((a, b) => a.at - b.at);
    return [...finalLines, ...progress];
  }, [finalLines, sync.remoteInterim, speech.interim, selfEmail, selfName]);

  const { clear: clearSpeech } = speech;
  const { clearRemote } = sync;
  const clear = useCallback(() => {
    clearSpeech();
    clearRemote();
  }, [clearSpeech, clearRemote]);

  return {
    lines,
    finalLines,
    supported: speech.supported,
    unsupportedReason: speech.unsupportedReason,
    listening: speech.listening,
    paused: speech.paused,
    muted: micMuted,
    error: speech.error,
    lang: speech.lang,
    setLang: speech.setLang,
    start: speech.start,
    stop: speech.stop,
    clear,
    share: sync.shareStatus,
  };
}

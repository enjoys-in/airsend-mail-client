"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TranscriptLine } from "../types";
import { defaultSttLang, readStoredSttLang, storeSttLang } from "./languages";

// ---------------------------------------------------------------------------
// useSpeechTranscription: live speech-to-text for the signed-in user's own microphone, using the browser's Web Speech API
// (SpeechRecognition / webkitSpeechRecognition). Chrome and Edge only; Firefox and Safari report `supported: false`.
// Chrome/Edge send the audio to the browser vendor's speech service.
//
// It recognises the DEFAULT microphone (the API cannot be fed a MediaStream), so a custom mic choice in the pre-join does not
// change what is transcribed. Everyone's lines are combined by `useMeetTranscript`.
// ---------------------------------------------------------------------------

// The DOM lib of this TypeScript version has no SpeechRecognition constructor; the minimal surface used here.
interface RecAlternative {
  transcript: string;
}
interface RecResult {
  isFinal: boolean;
  length: number;
  [index: number]: RecAlternative;
}
interface RecResultEvent {
  resultIndex: number;
  results: { length: number; [index: number]: RecResult };
}
interface RecErrorEvent {
  error: string;
  message?: string;
}
interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: RecErrorEvent) => void) | null;
  onresult: ((event: RecResultEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

const MAX_LINES = 500;
/** Chrome ends a recognition session after a stretch of silence; it is restarted after this base delay (doubling on failures). */
const BASE_BACKOFF_MS = 300;
const MAX_BACKOFF_MS = 8000;
/** A session that lived this long counts as healthy and resets the backoff. */
const HEALTHY_SESSION_MS = 4000;
const MAX_NETWORK_FAILURES = 5;
/** A hidden tab stops listening after this long (and resumes when it is visible again). */
const HIDDEN_STOP_MS = 60_000;

export const UNSUPPORTED_REASON =
  "Live captions need speech recognition, which this browser doesn't have. Use Chrome or Edge.";

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const FATAL_MESSAGES: Record<string, string> = {
  "not-allowed": "Microphone access is blocked. Allow the microphone for this site in your browser settings, then try again.",
  "service-not-allowed": "The browser's speech service is not available here (it needs a secure https page and may be disabled by policy).",
  "audio-capture": "No microphone was found for live captions.",
  "language-not-supported": "This browser can't transcribe the selected language. Pick another one.",
};

export interface UseSpeechTranscriptionOptions {
  /** Master switch: nothing is recognised while false. */
  enabled: boolean;
  /** Overrides the stored/browser language when set. */
  lang?: string;
  speakerId: string;
  speakerName: string;
  /** Muted users are not transcribed. */
  micMuted?: boolean;
}

export interface SpeechTranscription {
  supported: boolean;
  /** Why not, when `supported` is false. */
  unsupportedReason: string | null;
  /** The recogniser is running right now. */
  listening: boolean;
  /** Words still being decided (not yet a final line). */
  interim: string;
  /** Final lines of this user only (isSelf), oldest first, at most 500. */
  lines: TranscriptLine[];
  error: string | null;
  lang: string;
  setLang: (lang: string) => void;
  /** Turned off with `stop()`; `start()` also clears an error and retries. */
  paused: boolean;
  start: () => void;
  stop: () => void;
  clear: () => void;
}

export function useSpeechTranscription({
  enabled,
  lang: langOverride,
  speakerId,
  speakerName,
  micMuted = false,
}: UseSpeechTranscriptionOptions): SpeechTranscription {
  const [storedLang, setStoredLang] = useState("en-US");
  const lang = langOverride ?? storedLang;

  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [fatal, setFatal] = useState(false);
  const [hiddenLong, setHiddenLong] = useState(false);

  const speakerRef = useRef({ id: speakerId, name: speakerName });
  speakerRef.current = { id: speakerId, name: speakerName };
  const counter = useRef(0);

  // Browser support + the stored language, after mount (so server and client render the same first pass).
  useEffect(() => {
    setSupported(recognitionCtor() !== null);
    setStoredLang(readStoredSttLang() ?? defaultSttLang());
  }, []);

  // Hidden tab: stop listening after a while, resume when it is visible again.
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onChange = () => {
      if (timer) clearTimeout(timer);
      timer = null;
      if (document.hidden) timer = setTimeout(() => setHiddenLong(true), HIDDEN_STOP_MS);
      else setHiddenLong(false);
    };
    document.addEventListener("visibilitychange", onChange);
    return () => {
      document.removeEventListener("visibilitychange", onChange);
      if (timer) clearTimeout(timer);
      setHiddenLong(false);
    };
  }, [enabled]);

  const active = enabled && supported && !paused && !micMuted && !hiddenLong && !fatal;

  // The recogniser itself. Re-created when it should start/stop or the language changes.
  useEffect(() => {
    const Ctor = recognitionCtor();
    if (!active || !Ctor) {
      setListening(false);
      setInterim("");
      return;
    }

    let disposed = false;
    let rec: Recognition | null = null;
    let restartTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let networkFailures = 0;
    let startedAt = 0;

    const begin = () => {
      if (disposed) return;
      const next = new Ctor();
      rec = next;
      next.continuous = true;
      next.interimResults = true;
      next.maxAlternatives = 1;
      next.lang = lang;

      next.onstart = () => {
        startedAt = Date.now();
        setListening(true);
      };

      next.onresult = (event) => {
        attempts = 0;
        networkFailures = 0;
        setError((current) => (current === null ? current : null));
        let interimText = "";
        const finals: string[] = [];
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = (result[0]?.transcript ?? "").trim();
          if (!text) continue;
          if (result.isFinal) finals.push(text);
          else interimText += (interimText ? " " : "") + text;
        }
        if (finals.length > 0) {
          const { id, name } = speakerRef.current;
          const now = Date.now();
          const added: TranscriptLine[] = finals.map((text) => ({
            id: `${id || "me"}-${now}-${counter.current++}`,
            speakerId: id,
            speaker: name,
            text,
            at: now,
            isFinal: true,
            isSelf: true,
          }));
          setLines((previous) => [...previous, ...added].slice(-MAX_LINES));
        }
        setInterim(interimText);
      };

      next.onerror = (event) => {
        switch (event.error) {
          case "no-speech":
          case "aborted":
            return; // normal: silence, or we stopped it ourselves
          case "network":
            networkFailures += 1;
            if (networkFailures > MAX_NETWORK_FAILURES) {
              setError("Live captions lost the connection to the speech service. Check your network and try again.");
              setFatal(true);
            } else {
              setError("Reconnecting to the speech service…");
            }
            return;
          default: {
            const message = FATAL_MESSAGES[event.error];
            setError(message ?? `Speech recognition stopped (${event.error}).`);
            setFatal(true);
          }
        }
      };

      next.onend = () => {
        setListening(false);
        setInterim("");
        if (disposed) return;
        // Chrome ends a session on silence or after ~1 minute: start the next one.
        if (Date.now() - startedAt > HEALTHY_SESSION_MS) attempts = 0;
        const delay = Math.min(BASE_BACKOFF_MS * 2 ** attempts, MAX_BACKOFF_MS);
        attempts += 1;
        restartTimer = setTimeout(begin, delay);
      };

      try {
        next.start();
      } catch {
        // InvalidStateError when a previous session has not fully ended: the end handler restarts it
      }
    };

    begin();

    return () => {
      disposed = true;
      if (restartTimer) clearTimeout(restartTimer);
      if (rec) {
        rec.onstart = null;
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        try {
          rec.abort();
        } catch {
          // already stopped
        }
      }
      setListening(false);
      setInterim("");
    };
  }, [active, lang]);

  const setLang = useCallback((next: string) => {
    setStoredLang(next);
    storeSttLang(next);
    setError(null);
    setFatal(false);
  }, []);

  const start = useCallback(() => {
    setPaused(false);
    setFatal(false);
    setError(null);
  }, []);

  const stop = useCallback(() => setPaused(true), []);

  const clear = useCallback(() => {
    setLines([]);
    setInterim("");
  }, []);

  return {
    supported,
    unsupportedReason: supported ? null : UNSUPPORTED_REASON,
    listening,
    interim,
    lines,
    error,
    lang,
    setLang,
    paused,
    start,
    stop,
    clear,
  };
}

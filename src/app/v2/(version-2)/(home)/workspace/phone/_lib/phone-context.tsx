"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import FloatingCallPanel from "../_components/FloatingCallPanel";
import IncomingCallDialog from "../_components/IncomingCallDialog";
import type { IncomingCall, IntercomMe } from "./types";
import { usePhoneCall } from "./use-phone-call";
import { intercomApi } from "./voice-api";

type PhoneCallApi = ReturnType<typeof usePhoneCall>;

interface PhoneContextValue extends PhoneCallApi {
  me: IntercomMe | null | undefined;
  incoming: IncomingCall | undefined;
  accept: () => void;
  decline: () => void;
}

const PhoneContext = createContext<PhoneContextValue | null>(null);

const pingMs = 5000;
const phoneRoute = "/v2/workspace/phone";

export function usePhone(): PhoneContextValue {
  const value = useContext(PhoneContext);
  if (!value) throw new Error("usePhone must be used inside PhoneProvider");
  return value;
}

export function PhoneProvider({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const call = usePhoneCall();
  const [me, setMe] = useState<IntercomMe | null | undefined>(undefined);
  const [incoming, setIncoming] = useState<IncomingCall | undefined>(undefined);
  const busyRef = useRef(false);
  const ringRef = useRef<HTMLAudioElement | null>(null);

  busyRef.current = call.state.phase === "starting" || call.state.phase === "dialing" || call.state.phase === "connected";

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    let source: EventSource | undefined;
    let pinger: number | undefined;

    intercomApi
      .me()
      .then((self) => {
        if (!alive) return;
        setMe(self);
        source = new EventSource(intercomApi.streamUrl(), { withCredentials: true });
        source.addEventListener("incoming", (event) => {
          try {
            const data = JSON.parse((event as MessageEvent<string>).data) as IncomingCall;
            if (!busyRef.current) setIncoming(data);
          } catch {
            return;
          }
        });
        source.addEventListener("handled", (event) => {
          try {
            const data = JSON.parse((event as MessageEvent<string>).data) as { callId: string };
            setIncoming((current) => (current?.callId === data.callId ? undefined : current));
          } catch {
            return;
          }
        });
        pinger = window.setInterval(() => void intercomApi.ping().catch(() => undefined), pingMs);
      })
      .catch(() => {
        if (alive) setMe(null);
      });

    return () => {
      alive = false;
      source?.close();
      if (pinger !== undefined) window.clearInterval(pinger);
    };
  }, [enabled]);

  useEffect(() => {
    if (!incoming) return;
    const timer = window.setTimeout(() => setIncoming(undefined), incoming.ringSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [incoming]);

  useEffect(() => {
    if (!incoming) {
      ringRef.current?.pause();
      ringRef.current = null;
      return;
    }
    const audio = new Audio("/notification.mp3");
    audio.loop = true;
    ringRef.current = audio;
    void audio.play().catch(() => undefined);
    return () => {
      audio.pause();
    };
  }, [incoming]);

  const accept = useCallback(() => {
    if (!incoming) return;
    const target = incoming;
    setIncoming(undefined);
    void call.answerIncoming(target);
  }, [incoming, call]);

  const decline = useCallback(() => {
    if (!incoming) return;
    const target = incoming;
    setIncoming(undefined);
    void intercomApi.decline(target.callId).catch(() => undefined);
  }, [incoming]);

  const value = useMemo<PhoneContextValue>(
    () => ({ ...call, me, incoming, accept, decline }),
    [call, me, incoming, accept, decline],
  );

  return (
    <PhoneContext.Provider value={value}>
      {children}
      {call.state.phase !== "idle" && !pathname.startsWith(phoneRoute) && (
        <FloatingCallPanel
          state={call.state}
          selfExtension={me?.extension}
          onHangup={() => void call.hangup()}
          onMute={() => void call.toggleMute()}
          onDismiss={call.reset}
          onExpand={() => router.push(phoneRoute)}
          onOpenChat={call.state.context ? () => router.push(`/v2/workspace/dm/${call.state.context?.id}`) : undefined}
          onCamera={() => void call.toggleCamera()}
          onScreen={() => void call.toggleScreenShare()}
          onInvite={call.invite}
          onGuestLink={call.guestLink}
          onAnswerGuest={call.answerGuest}
        />
      )}
      {incoming && <IncomingCallDialog incoming={incoming} onAccept={accept} onDecline={decline} />}
    </PhoneContext.Provider>
  );
}

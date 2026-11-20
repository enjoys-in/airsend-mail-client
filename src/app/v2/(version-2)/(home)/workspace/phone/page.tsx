"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WorkspaceErrorBoundary from "../_components/WorkspaceErrorBoundary";
import ActiveCallPanel from "./_components/ActiveCallPanel";
import CallHistory from "./_components/CallHistory";
import Colleagues from "./_components/Colleagues";
import Keypad from "./_components/Keypad";
import VoicemailInbox from "./_components/VoicemailInbox";
import { looksCallable } from "./_lib/number";
import { usePhone } from "./_lib/phone-context";
import { useVoiceOverview } from "./_lib/use-voice-overview";

function PhoneWorkspace() {
  const overview = useVoiceOverview();
  const { state, start, hangup, toggleMute, toggleCamera, toggleScreenShare, sendDigit, reset, invite, guestLink, answerGuest, me } = usePhone();
  const [number, setNumber] = useState("");
  const [trunkId, setTrunkId] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const lastPhase = useRef(state.phase);

  useEffect(() => {
    if (lastPhase.current !== state.phase && (state.phase === "ended" || state.phase === "failed")) {
      setRefreshKey((current) => current + 1);
    }
    lastPhase.current = state.phase;
  }, [state.phase]);

  if (overview === undefined || me === undefined) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 p-6" data-testid="phone-loading">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const pstnEnabled = overview?.enabled === true;
  const internalEnabled = me !== null;

  if (!pstnEnabled && !internalEnabled) {
    return (
      <div
        className="mx-auto flex w-full max-w-md flex-col items-center gap-3 p-10 text-center"
        data-testid="phone-disabled"
      >
        <PhoneOff className="size-10 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Calling is not available</h1>
        <p className="text-sm text-muted-foreground">
          Sign in with your AirSend workspace account to call colleagues. Calling outside numbers needs an administrator to enable it.
        </p>
      </div>
    );
  }

  const busy = state.phase === "starting" || state.phase === "dialing" || state.phase === "connected";
  const inCall = state.phase !== "idle";
  const dialError = state.phase === "failed" && !state.callId ? state.message : "";
  const trunks = overview?.trunks ?? [];
  const defaultTab = pstnEnabled ? "recents" : "colleagues";

  const dial = (target: string) => {
    if (!looksCallable(target, pstnEnabled) || busy) return;
    setNumber(target);
    void start(target, trunkId ? { trunkId } : {});
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="flex items-center gap-2">
          <Phone className="size-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Phone</h1>
        </div>
        {me && (
          <span className="text-sm text-muted-foreground" data-testid="phone-identity">
            Your extension <b className="font-mono text-foreground">{me.extension}</b>
            <span className="hidden sm:inline"> · {me.sipAddress}</span>
          </span>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <section className="rounded-xl border border-border/50 bg-card p-4" aria-label="Dialer">
          {inCall && !dialError ? (
            <ActiveCallPanel
              state={state}
              onHangup={() => void hangup()}
              onMute={() => void toggleMute()}
              onDigit={(digit) => void sendDigit(digit)}
              onDone={reset}
              onInvite={invite}
              onGuestLink={guestLink}
              onCamera={() => void toggleCamera()}
              onScreen={() => void toggleScreenShare()}
              onAnswerGuest={answerGuest}
              selfExtension={me?.extension}
              onRedial={() => {
                const target = state.target;
                reset();
                dial(target);
              }}
            />
          ) : (
            <div className="space-y-3">
              {pstnEnabled && trunks.length > 1 && (
                <Select value={trunkId ?? trunks[0]?.id} onValueChange={setTrunkId}>
                  <SelectTrigger className="h-9" data-testid="phone-trunk" aria-label="Calling line">
                    <SelectValue placeholder="Calling line" />
                  </SelectTrigger>
                  <SelectContent>
                    {trunks.map((trunk) => (
                      <SelectItem key={trunk.id} value={trunk.id}>
                        {trunk.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Keypad
                value={number}
                pstnEnabled={pstnEnabled}
                onChange={(value) => {
                  if (state.phase === "failed") reset();
                  setNumber(value);
                }}
                onDial={() => dial(number)}
                error={dialError}
              />
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border/50 bg-card p-4" aria-label="People and history">
          <Tabs defaultValue={defaultTab}>
            <TabsList>
              {internalEnabled && (
                <TabsTrigger value="colleagues" data-testid="tab-colleagues">
                  Colleagues
                </TabsTrigger>
              )}
              {pstnEnabled && (
                <TabsTrigger value="recents" data-testid="tab-recents">
                  Recents
                </TabsTrigger>
              )}
              {pstnEnabled && overview?.voicemail && (
                <TabsTrigger value="voicemail" data-testid="tab-voicemail">
                  Voicemail
                </TabsTrigger>
              )}
            </TabsList>
            {internalEnabled && (
              <TabsContent value="colleagues" className="mt-3">
                <Colleagues onCall={dial} disabled={busy} />
              </TabsContent>
            )}
            {pstnEnabled && (
              <TabsContent value="recents" className="mt-3">
                <CallHistory refreshKey={refreshKey} onCall={dial} disabled={busy} />
              </TabsContent>
            )}
            {pstnEnabled && overview?.voicemail && (
              <TabsContent value="voicemail" className="mt-3">
                <VoicemailInbox />
              </TabsContent>
            )}
          </Tabs>
        </section>
      </div>
    </div>
  );
}

export default function PhonePage() {
  return (
    <WorkspaceErrorBoundary>
      <PhoneWorkspace />
    </WorkspaceErrorBoundary>
  );
}

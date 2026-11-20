"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatClock, formatWhen } from "../_lib/number";
import type { PhoneVoicemail } from "../_lib/types";
import { voiceApi } from "../_lib/voice-api";

export default function VoicemailInbox() {
  const [items, setItems] = useState<PhoneVoicemail[] | undefined>(undefined);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState<string | undefined>(undefined);
  const [loadingAudio, setLoadingAudio] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<PhoneVoicemail | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | undefined>(undefined);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    audioRef.current = null;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = undefined;
    setPlaying(undefined);
  }, []);

  const load = useCallback(async () => {
    try {
      const result = await voiceApi.voicemails();
      setItems(result.voicemails);
      setError("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not load voicemail");
    }
  }, []);

  useEffect(() => {
    void load();
    return stop;
  }, [load, stop]);

  const toggle = async (item: PhoneVoicemail) => {
    if (playing === item.id) {
      stop();
      return;
    }
    stop();
    setLoadingAudio(item.id);
    try {
      const blob = await voiceApi.voicemailAudio(item.id);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      urlRef.current = url;
      audioRef.current = audio;
      audio.addEventListener("ended", stop);
      audio.addEventListener("error", () => {
        stop();
        toast.error("This voicemail could not be played");
      });
      await audio.play();
      setPlaying(item.id);
    } catch (failure) {
      stop();
      toast.error(failure instanceof Error ? failure.message : "This voicemail could not be played");
    } finally {
      setLoadingAudio(undefined);
    }
  };

  const confirmDelete = async () => {
    const target = pendingDelete;
    setPendingDelete(undefined);
    if (!target) return;
    if (playing === target.id) stop();
    try {
      await voiceApi.deleteVoicemail(target.id);
      setItems((current) => current?.filter((entry) => entry.id !== target.id));
      toast.success("Voicemail deleted");
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : "Could not delete the voicemail");
    }
  };

  if (error && !items) {
    return (
      <div className="space-y-2 py-6 text-center text-sm text-muted-foreground" data-testid="voicemail-error">
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={() => void load()} className="gap-1.5">
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (!items) {
    return (
      <div className="space-y-2" data-testid="voicemail-loading">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground" data-testid="voicemail-empty">
        No voicemail. Messages left for the team will show up here.
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border/50" data-testid="voicemail-list">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-2.5" data-testid="voicemail-item">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9 shrink-0 rounded-full"
              onClick={() => void toggle(item)}
              disabled={loadingAudio === item.id}
              aria-label={playing === item.id ? "Pause voicemail" : "Play voicemail"}
              data-testid="voicemail-play"
            >
              {playing === item.id ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-sm">{item.from}</p>
              <p className="text-xs text-muted-foreground">{formatClock(item.durationMs / 1000)}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{formatWhen(item.createdAt)}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              onClick={() => setPendingDelete(item)}
              aria-label="Delete voicemail"
              data-testid="voicemail-delete"
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>

      <AlertDialog open={pendingDelete !== undefined} onOpenChange={(open) => !open && setPendingDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this voicemail?</AlertDialogTitle>
            <AlertDialogDescription>
              The recording from {pendingDelete?.from} will be removed for everyone on the team. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()} data-testid="voicemail-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

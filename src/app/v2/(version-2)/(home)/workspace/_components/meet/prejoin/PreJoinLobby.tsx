"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { formatMeetUrl } from "../../../_lib/api";
import PreJoinScreen, { type PreJoinScreenProps } from "./PreJoinScreen";

export type PreJoinLobbyProps = Omit<PreJoinScreenProps, "onBack" | "joinLink"> & {
  /** Defaults to the calls list. */
  onBack?: () => void;
  /** Defaults to the meeting link for `roomId`. */
  joinLink?: string;
};

/** `PreJoinScreen` with the workspace defaults filled in (where "back" goes and what the meeting link is). */
export default function PreJoinLobby({ onBack, joinLink, ...props }: PreJoinLobbyProps) {
  const router = useRouter();
  return (
    <PreJoinScreen
      {...props}
      joinLink={joinLink ?? formatMeetUrl(props.roomId)}
      onBack={onBack ?? (() => router.push("/v2/workspace/calls"))}
    />
  );
}

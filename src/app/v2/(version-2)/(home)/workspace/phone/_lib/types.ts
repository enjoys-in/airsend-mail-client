export type PhoneCallStatus = "dialing" | "ringing" | "answered" | "ended" | "failed" | "blocked";

export interface PhoneCall {
  id: string;
  direction: "inbound" | "outbound";
  status: PhoneCallStatus;
  from: string;
  to: string;
  country?: string;
  room: string;
  endReason?: string;
  createdAt: string;
  answeredAt?: string;
  endedAt?: string;
  durationSeconds: number;
}

export interface JoinInfo {
  url: string;
  token: string;
  room: string;
  identity: string;
}

export interface PhoneTrunk {
  id: string;
  name: string;
  numbers: string[];
}

export interface VoiceOverview {
  enabled: boolean;
  user: { email: string; name: string };
  trunks: PhoneTrunk[];
  allowedCountries: string[];
  voicemail: boolean;
}

export interface PhoneVoicemail {
  id: string;
  from: string;
  to: string;
  durationMs: number;
  audioUrl: string;
  createdAt: string;
}

export type CallPhase = "idle" | "starting" | "dialing" | "connected" | "ended" | "failed";

export type CallKind = "pstn" | "internal";

export interface IntercomMe {
  extension: string;
  sipAddress: string;
  name: string;
  scope: string;
  phoneNumber: string | null;
}

export interface Colleague {
  name: string;
  email: string;
  extension: string;
  online: boolean;
}

export type IntercomStatus = "ringing" | "active" | "ended" | "missed" | "declined" | "cancelled";

export type ParticipantState =
  | "ringing" | "joined" | "left" | "declined" | "missed" | "cancelled" | "busy" | "unreachable" | "waiting" | "denied";

export interface IntercomParticipant {
  email: string;
  name: string;
  extension: string;
  role: "caller" | "callee" | "invited" | "guest";
  state: ParticipantState;
}

export type CallMedia = "audio" | "video";

export interface CallContext {
  id: string;
  kind: "dm" | "group";
  name: string;
}

export interface IntercomCall {
  media?: CallMedia;
  context?: CallContext;
  participants: IntercomParticipant[];
  id: string;
  status: IntercomStatus;
  endReason?: string;
  room: string;
  callerEmail: string;
  calleeEmail: string;
  createdAt: string;
  answeredAt?: string;
}

export interface IncomingCall {
  media?: CallMedia;
  context?: CallContext;
  invited?: boolean;
  participants?: string[];
  callId: string;
  from: { name: string; email: string; extension: string };
  ringSeconds: number;
}

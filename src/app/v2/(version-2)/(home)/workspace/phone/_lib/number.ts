export function sanitizeNumber(raw: string): string {
  let value = raw.replace(/[^\d+*#]/g, "");
  if (value.startsWith("00")) value = `+${value.slice(2)}`;
  const plus = value.startsWith("+");
  const rest = value.slice(plus ? 1 : 0).replace(/\+/g, "");
  return (plus ? "+" : "") + rest;
}

export function looksDialable(value: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(value);
}

export function isInternalTarget(value: string): boolean {
  return /^\d{1,9}$/.test(value) || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

export function looksCallable(value: string, pstnEnabled: boolean): boolean {
  return isInternalTarget(value) || (pstnEnabled && looksDialable(value));
}

const reasons: Record<string, string> = {
  busy: "The line is busy",
  no_answer: "No answer",
  declined: "The call was declined",
  number_not_found: "That number does not exist",
  carrier_rejected: "The carrier rejected the call",
  cancelled: "Cancelled",
  provider_error: "The call could not be connected",
};

export function reasonText(reason: string | undefined): string {
  if (!reason) return "";
  return reasons[reason] ?? reason.replace(/_/g, " ");
}

export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay
    ? date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

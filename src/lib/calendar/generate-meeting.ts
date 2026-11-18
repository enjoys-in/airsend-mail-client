// ============================================================================
// AirSend Meeting Link Generator
// Generates secure meeting rooms via meet.airsend.in backend API server
// with graceful client-side fallback.
// ============================================================================

export function getMeetApiUrl(): string {
  let url = "";
  if (typeof window !== "undefined") {
    if ((window as any).__RUNTIME_CONFIG__?.MEET_API_URL) {
      url = (window as any).__RUNTIME_CONFIG__.MEET_API_URL;
    }
    // Local dev: meeting server is on port 8085
    if (!url && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      return "http://localhost:8085";
    }
  }
  if (!url) {
    url = process.env.MEET_API_URL || "http://localhost:8085";
  }
  url = url.trim().replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    if (url.startsWith("http://")) {
      url = url.replace(/^http:\/\//, "https://");
    } else if (url.startsWith("//")) {
      url = `https:${url}`;
    }
  }
  return url;
}

export function getMeetBaseUrl(): string {
  let url = "";
  if (typeof window !== "undefined") {
    if ((window as any).__RUNTIME_CONFIG__?.MEET_URL) {
      return (window as any).__RUNTIME_CONFIG__.MEET_URL;
    }
    // Local dev: meeting app is on Vite dev port 5173
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:5173";
    }
  }
  if (!url) {
    url = process.env.MEET_URL || "https://meet.airsend.in";
  }
  url = url.trim().replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    if (url.startsWith("http://")) {
      url = url.replace(/^http:\/\//, "https://");
    } else if (url.startsWith("//")) {
      url = `https:${url}`;
    }
  }
  return url;
}

export function getAuthToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  if (match && match[1]) return decodeURIComponent(match[1]);
  try {
    return window.localStorage.getItem("access_token") ?? "";
  } catch {
    return "";
  }
}

/** Generates standard Google Meet style code: xxx-yyyy-zzz */
export function generateLocalMeetCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const rand = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${rand(3)}-${rand(4)}-${rand(3)}`;
}

export interface GeneratedMeetingResult {
  url: string;
  roomId: string;
  source: "api" | "generated";
}

/**
 * Creates a meeting room using the meet.airsend.in backend API server.
 * If the API is unreachable (e.g. offline dev), safely falls back to a standardized room code.
 */
export async function createAirSendMeeting(title?: string): Promise<GeneratedMeetingResult> {
  const fallbackCode = generateLocalMeetCode();
  const baseUrl = getMeetBaseUrl().replace(/\/+$/, "");

  try {
    const apiUrl = getMeetApiUrl().replace(/\/+$/, "");
    const token = getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${apiUrl}/api/rooms`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        title: title?.trim() || "AirSend Meeting",
        customRoomId: fallbackCode,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const roomId = data.roomId || fallbackCode;
      return {
        url: `${baseUrl}/${roomId}`,
        roomId,
        source: "api",
      };
    }
  } catch (err) {
    console.warn("[AirSend Meet] Could not reach meeting API, using local room code:", err);
  }

  return {
    url: `${baseUrl}/${fallbackCode}`,
    roomId: fallbackCode,
    source: "generated",
  };
}

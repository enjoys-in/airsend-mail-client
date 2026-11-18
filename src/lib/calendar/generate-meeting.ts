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
    const res = await fetch(`${apiUrl}/api/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

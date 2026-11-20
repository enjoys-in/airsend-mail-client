export type AuthScope = "user" | "admin"

interface LogoutMessage {
  type: "logout"
  scope: AuthScope
  sender: string
  sentAt: number
}

const CHANNEL_NAME = "airsend-auth"
const STORAGE_KEY = "airsend-auth-logout"

const senderId =
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

let channel: BroadcastChannel | null = null

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME)
  return channel
}

function isLogoutMessage(value: unknown): value is LogoutMessage {
  if (typeof value !== "object" || value === null) return false
  const candidate = value as Partial<LogoutMessage>
  return (
    candidate.type === "logout" &&
    (candidate.scope === "user" || candidate.scope === "admin") &&
    typeof candidate.sender === "string"
  )
}

export function broadcastLogout(scope: AuthScope): void {
  if (typeof window === "undefined") return
  const message: LogoutMessage = { type: "logout", scope, sender: senderId, sentAt: Date.now() }

  const live = getChannel()
  if (live) {
    try {
      live.postMessage(message)
      return
    } catch {
      channel = null
    }
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(message))
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
}

export function onRemoteLogout(handler: (scope: AuthScope) => void): () => void {
  if (typeof window === "undefined") return () => undefined

  const handle = (value: unknown) => {
    if (!isLogoutMessage(value) || value.sender === senderId) return
    handler(value.scope)
  }

  const live = getChannel()
  const onMessage = (event: MessageEvent) => handle(event.data)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return
    try {
      handle(JSON.parse(event.newValue))
    } catch {
      return
    }
  }

  live?.addEventListener("message", onMessage)
  window.addEventListener("storage", onStorage)

  return () => {
    live?.removeEventListener("message", onMessage)
    window.removeEventListener("storage", onStorage)
  }
}

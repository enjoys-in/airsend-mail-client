// ============================================================================
// Files service client (browser -> files backend, direct).
//
// Workspace uploads do NOT go through the workspace server. For a chat attachment the
// browser first creates the message on the workspace server, uploads the bytes here with
// that message id (the file is stored under the same id), and then tells the workspace
// server "this message has file <id>" (see workspaceApi.add*Ref). Downloads fetch the
// bytes from this service by file id (= message id for chat attachments). Every call sends the AirSend `access_token` cookie
// (credentials: "include"); a Bearer header is added when the cookie is readable.
// ============================================================================

import { authHeaders } from "./api"

/** The files backend, from the runtime config the root layout injects (server env `FILES_API_URL`). */
export function getFilesApiUrl(): string {
  const runtime =
    typeof window !== "undefined"
      ? (window as { __RUNTIME_CONFIG__?: Record<string, string> }).__RUNTIME_CONFIG__?.FILES_API_URL
      : undefined
  return (runtime || process.env.FILES_API_URL || "http://localhost:1284").trim().replace(/\/+$/, "")
}

export type WorkspaceFileContext = "channel" | "dm" | "team"

/** What the files service stores for a workspace upload. */
export interface WorkspaceFileMeta {
  id: string
  name: string
  extension: string
  mimeType: string
  size: number
  contextType: WorkspaceFileContext
  contextId: string
  createdAt?: string
}

/** One of the ORGANIZATION's storage accounts (S3-compatible or Telegram), as GET /api/account lists them. */
export interface StorageAccount {
  id: string
  providerId: string
  accountId: string
  nickname?: string | null
  isDefault?: boolean
}

/** The signed-in user's organization as the files service reports it (GET /api/auth/get-session). */
export interface FilesOrganization {
  id: string
  name: string
  role: "owner" | "admin" | "member"
  /** Owners and admins configure the organization's storage in Files. */
  canManageStorage: boolean
}

/** Error from the files service; `message` is the server's own text when it sent one. */
export class FilesApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "FilesApiError"
    this.status = status
  }
  /** The organization has not configured storage yet (409 from the files service). */
  get isNoStorage() {
    return this.status === 409
  }
}

/** Friendly, user-facing text for a failed files call (toast / inline error). */
export function filesErrorMessage(err: unknown, fallback = "Something went wrong with the file", _context?: WorkspaceFileContext): string {
  if (err instanceof FilesApiError) {
    switch (err.status) {
      case 0:
        return "Can't reach the files service. Check your connection and try again."
      case 401:
        return "Your session has expired. Please sign in again."
      case 403:
        return err.message && !/^forbidden$/i.test(err.message)
          ? err.message
          : "You're not a member of this team or conversation, so you can't use its files."
      case 404:
        return "That file no longer exists."
      case 409:
        return noStorageMessage()
      case 413:
        return err.message || "That file is too large for this storage."
      default:
        return err.message || fallback
    }
  }
  return (err as Error)?.message || fallback
}

async function readError(res: Response): Promise<FilesApiError> {
  let message = ""
  try {
    const text = await res.text()
    try {
      const json = JSON.parse(text)
      message = json?.message ?? json?.error ?? ""
    } catch {
      message = text.slice(0, 200)
    }
  } catch {
    /* no body */
  }
  // "No storage configured": find out whether this user may set it up, so the message can point to Files or to an admin.
  if (res.status === 409) await getFilesOrganization().catch(() => null)
  return new FilesApiError(message || res.statusText || `HTTP ${res.status}`, res.status)
}

async function filesFetch(path: string, init?: RequestInit): Promise<Response> {
  let res: Response
  try {
    res = await fetch(`${getFilesApiUrl()}${path}`, {
      ...init,
      credentials: "include",
      headers: { ...authHeaders(), ...(init?.headers ?? {}) },
    })
  } catch {
    throw new FilesApiError("Can't reach the files service", 0)
  }
  if (!res.ok) throw await readError(res)
  return res
}

async function filesJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await filesFetch(path, init)
  if (res.status === 204) return null as T
  const json = await res.json().catch(() => null)
  // The service unwraps `data`; tolerate `{ data: ... }` too.
  return (json && typeof json === "object" && "data" in json && Object.keys(json).length <= 2 ? json.data : json) as T
}

const FILE_ID = /^[A-Za-z0-9_-]{1,128}$/

function normalizeMeta(raw: any): WorkspaceFileMeta {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    extension: String(raw.extension ?? "").replace(/^\./, "").toLowerCase(),
    mimeType: String(raw.mimeType ?? raw.mime_type ?? "application/octet-stream"),
    size: Number(raw.size ?? 0),
    contextType: raw.contextType ?? raw.context_type,
    contextId: String(raw.contextId ?? raw.context_id ?? ""),
    createdAt: raw.createdAt ?? raw.created_at,
  }
}

// ── Upload ──

/**
 * Uploads one file to the organization's storage through the files service.
 * Uses XMLHttpRequest so the UI can show real upload progress (fetch has none).
 *
 * `messageId` (chat attachments): the workspace message created for this file; the files service stores the file under
 * that same id, so the attachment's file_id equals the message id. Omit it for team Files uploads.
 */
export function uploadWorkspaceFile(
  file: File,
  contextType: WorkspaceFileContext,
  contextId: string,
  opts?: { onProgress?: (percent: number) => void; signal?: AbortSignal; messageId?: string },
): Promise<WorkspaceFileMeta> {
  return new Promise((resolve, reject) => {
    // The service streams the body and must know the context BEFORE the file part arrives, so the fields go in the
    // query string too (and first in the form below).
    const params = new URLSearchParams({ contextType, contextId })
    if (opts?.messageId) params.set("messageId", opts.messageId)
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${getFilesApiUrl()}/api/workspace/files?${params}`)
    xhr.withCredentials = true
    for (const [k, v] of Object.entries(authHeaders())) xhr.setRequestHeader(k, v)
    xhr.responseType = "text"

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts?.onProgress?.(Math.min(99, Math.round((e.loaded / e.total) * 100)))
    }
    xhr.onerror = () => reject(new FilesApiError("Can't reach the files service", 0))
    xhr.onabort = () => reject(new FilesApiError("Upload cancelled", 0))
    xhr.onload = () => {
      let body: any = null
      try {
        body = JSON.parse(xhr.responseText)
      } catch {
        /* non-JSON error body */
      }
      if (xhr.status >= 200 && xhr.status < 300 && body) {
        opts?.onProgress?.(100)
        resolve(normalizeMeta(body.data ?? body))
      } else {
        reject(new FilesApiError(body?.message ?? body?.error ?? (xhr.responseText || xhr.statusText).slice(0, 200), xhr.status))
      }
    }

    if (opts?.signal) {
      if (opts.signal.aborted) return reject(new FilesApiError("Upload cancelled", 0))
      opts.signal.addEventListener("abort", () => xhr.abort(), { once: true })
    }

    // Order matters: every field before `file`.
    const form = new FormData()
    form.append("contextType", contextType)
    form.append("contextId", contextId)
    if (opts?.messageId) form.append("messageId", opts.messageId)
    form.append("file", file)
    xhr.send(form)
  })
}

/**
 * Attaches an existing file to another message (forward, or "use the file already uploaded"): the files service adds a
 * row under `messageId` pointing at the same stored bytes, so the target conversation can download it.
 */
export async function shareWorkspaceFile(
  fileId: string,
  contextType: Exclude<WorkspaceFileContext, "team">,
  contextId: string,
  messageId: string,
): Promise<WorkspaceFileMeta> {
  if (!FILE_ID.test(fileId)) throw new FilesApiError("Invalid file id", 400)
  const raw = await filesJson<any>(`/api/workspace/files/${encodeURIComponent(fileId)}/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contextType, contextId, messageId }),
  })
  return normalizeMeta(raw)
}

// ── Metadata & download ──

export async function getWorkspaceFileMeta(fileId: string): Promise<WorkspaceFileMeta> {
  if (!FILE_ID.test(fileId)) throw new FilesApiError("Invalid file id", 400)
  return normalizeMeta(await filesJson<any>(`/api/workspace/files/${encodeURIComponent(fileId)}`))
}

/** The raw bytes of a workspace file (used for downloads and image previews). */
export async function fetchWorkspaceFileBlob(fileId: string): Promise<{ blob: Blob; filename?: string }> {
  if (!FILE_ID.test(fileId)) throw new FilesApiError("Invalid file id", 400)
  const res = await filesFetch(`/api/workspace/files/${encodeURIComponent(fileId)}/download`)
  const disposition = res.headers.get("content-disposition") ?? ""
  const star = /filename\*=UTF-8''([^;]+)/i.exec(disposition)
  const plain = /filename="?([^";]+)"?/i.exec(disposition)
  let filename: string | undefined
  try {
    filename = star ? decodeURIComponent(star[1]) : plain?.[1]
  } catch {
    filename = plain?.[1]
  }
  return { blob: await res.blob(), filename }
}

/** Saves a workspace file to disk. Errors are thrown so the caller can toast them. */
export async function downloadWorkspaceFile(fileId: string, fallbackName = "download"): Promise<void> {
  const { blob, filename } = await fetchWorkspaceFileBlob(fileId)
  saveBlob(blob, filename || fallbackName)
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** Removes the stored bytes of a workspace file (best effort; the workspace record is deleted separately). */
export async function deleteWorkspaceFile(fileId: string): Promise<void> {
  if (!FILE_ID.test(fileId)) return
  await filesFetch(`/api/workspace/files/${encodeURIComponent(fileId)}`, { method: "DELETE" })
}

// ── Organization storage ──
//
// Storage is configured once per ORGANIZATION (S3-compatible bucket or Telegram bot), by an owner or admin in Files
// (/v2/files). Workspace uploads always go to the organization's default storage, so there is nothing to pick per team.

const ORG_TTL_MS = 60_000
let orgCache: { at: number; value: FilesOrganization | null } | null = null
let orgInFlight: Promise<FilesOrganization | null> | null = null

/** The user's organization and whether they can manage its storage (cached for a minute). null when unknown or none. */
export function getFilesOrganization(): Promise<FilesOrganization | null> {
  if (orgCache && Date.now() - orgCache.at < ORG_TTL_MS) return Promise.resolve(orgCache.value)
  orgInFlight ??= (async () => {
    try {
      const res = await fetch(`${getFilesApiUrl()}/api/auth/get-session`, {
        credentials: "include",
        headers: authHeaders(),
      })
      const json = res.ok ? await res.json().catch(() => null) : null
      const raw = json?.organization
      const value: FilesOrganization | null = raw
        ? {
            id: String(raw.id),
            name: String(raw.name ?? ""),
            role: raw.role === "owner" || raw.role === "admin" ? raw.role : "member",
            canManageStorage: !!raw.canManageStorage,
          }
        : null
      orgCache = { at: Date.now(), value }
      return value
    } catch {
      return null
    } finally {
      orgInFlight = null
    }
  })()
  return orgInFlight
}

/** Where to send people when uploads fail because the organization has no storage. */
export const FILES_SETUP_PATH = "/v2/files"

/** Message for "the organization has no storage yet", written for this user's role (uses the cached organization). */
export function noStorageMessage(): string {
  if (orgCache?.value?.canManageStorage) {
    return "Your organization has not set up file storage yet. Connect it in Files."
  }
  return "Your organization has not set up file storage yet. Ask an organization owner or admin to set it up."
}

/** The organization's storage accounts (any member can list them). */
export async function listStorageAccounts(): Promise<StorageAccount[]> {
  const res = await filesJson<StorageAccount[]>("/api/account")
  return Array.isArray(res) ? res : []
}

/** The organization's default storage (or its first account), or null when none is configured. */
export async function getOrgStorage(): Promise<StorageAccount | null> {
  const accounts = await listStorageAccounts()
  return accounts.find((a) => a.isDefault) ?? accounts[0] ?? null
}

// ── Pins (per user, files-service file ids) ──

/** The files-service ids of the workspace files the signed-in user pinned. */
export async function listPinnedFileIds(): Promise<string[]> {
  const res = await filesJson<unknown>("/api/workspace/pins")
  return Array.isArray(res) ? res.map(String) : []
}

export async function setFilePinned(fileId: string, pinned: boolean): Promise<boolean> {
  if (!FILE_ID.test(fileId)) throw new FilesApiError("Invalid file id", 400)
  const res = await filesJson<{ pinned?: boolean } | null>(
    `/api/workspace/files/${encodeURIComponent(fileId)}/pin`,
    { method: pinned ? "PUT" : "DELETE" },
  )
  return res?.pinned ?? pinned
}

// ── Shares (public links and people in the organization) ──

export type ShareKind = "workspace"

export interface ShareLink {
  id: string
  token: string
  kind: ShareKind
  fileId: string
  name: string
  mimeType: string
  size: number
  createdBy: string
  createdAt: string
  expiresAt: string | null
  downloadCount: number
  /** Absolute public download link. */
  url: string
}

export interface ShareUser {
  id: string
  kind: ShareKind
  fileId: string
  name: string
  mimeType: string
  size: number
  sharedBy: string
  sharedWith: string
  createdAt: string
}

export type SharedWithMe = ShareUser & { providerId?: string; accountId?: string }

const SHARE_ID = /^[A-Za-z0-9_-]{1,128}$/
const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
})

function shareQuery(fileId: string): string {
  return new URLSearchParams({ kind: "workspace", fileId }).toString()
}

function checkId(id: string, what: string) {
  if (!SHARE_ID.test(id)) throw new FilesApiError(`Invalid ${what}`, 400)
}

export async function listShareLinks(fileId: string): Promise<ShareLink[]> {
  checkId(fileId, "file id")
  const res = await filesJson<ShareLink[]>(`/api/shares/links?${shareQuery(fileId)}`)
  return Array.isArray(res) ? res : []
}

/** `expiresInDays` null (or omitted) = never expires. */
export async function createShareLink(fileId: string, expiresInDays: number | null): Promise<ShareLink> {
  checkId(fileId, "file id")
  return filesJson<ShareLink>("/api/shares/links", jsonInit("POST", { kind: "workspace", fileId, expiresInDays }))
}

export async function revokeShareLink(id: string): Promise<void> {
  checkId(id, "link id")
  await filesFetch(`/api/shares/links/${encodeURIComponent(id)}`, { method: "DELETE" })
}

export async function listShareUsers(fileId: string): Promise<ShareUser[]> {
  checkId(fileId, "file id")
  const res = await filesJson<ShareUser[]>(`/api/shares/users?${shareQuery(fileId)}`)
  return Array.isArray(res) ? res : []
}

/** 400 (with the server's message) when an email is not in the organization. */
export async function shareWithUsers(fileId: string, emails: string[]): Promise<ShareUser[]> {
  checkId(fileId, "file id")
  const res = await filesJson<ShareUser[]>("/api/shares/users", jsonInit("POST", { kind: "workspace", fileId, emails }))
  return Array.isArray(res) ? res : []
}

export async function removeShareUser(id: string): Promise<void> {
  checkId(id, "share id")
  await filesFetch(`/api/shares/users/${encodeURIComponent(id)}`, { method: "DELETE" })
}

export async function listSharedWithMe(): Promise<SharedWithMe[]> {
  const res = await filesJson<SharedWithMe[]>("/api/shares/with-me")
  return Array.isArray(res) ? res : []
}

/** Saves a file someone shared with me. Errors are thrown so the caller can toast them. */
export async function downloadSharedWithMe(id: string, fallbackName = "download"): Promise<void> {
  checkId(id, "share id")
  const res = await filesFetch(`/api/shares/with-me/${encodeURIComponent(id)}/download`)
  saveBlob(await res.blob(), fallbackName)
}

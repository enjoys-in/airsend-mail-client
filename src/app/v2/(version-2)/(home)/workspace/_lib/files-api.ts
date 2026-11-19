// ============================================================================
// Files service client (browser -> files backend, direct).
//
// Workspace uploads do NOT go through the workspace server. The browser uploads the
// bytes here first, gets a file id back, and only then tells the workspace server
// "this message has file <id>" (see workspaceApi.add*Ref). Downloads fetch the bytes
// from this service by file id. Every call sends the AirSend `access_token` cookie
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

export interface TeamStorage {
  accountId: string
  providerId: string
  nickname?: string | null
}

export interface StorageAccount {
  id: string
  providerId: string
  accountId: string
  nickname?: string | null
}

/** Error from the files service; `message` is the server's own text when it sent one. */
export class FilesApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "FilesApiError"
    this.status = status
  }
  /** The team has no storage account yet (409 from the files service). */
  get isNoStorage() {
    return this.status === 409
  }
}

/** Friendly, user-facing text for a failed files call (toast / inline error). */
export function filesErrorMessage(err: unknown, fallback = "Something went wrong with the file", context?: WorkspaceFileContext): string {
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
        // Channel and team uploads go to the team's storage; DM uploads go to the sender's own account.
        if (context === "dm") {
          return "Connect a storage account in Files first. Files you send in direct messages are stored in your own account."
        }
        return err.message || "No storage is configured for this team. Ask a team admin to connect a storage account."
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
 * Uploads one file to the team's storage through the files service.
 * Uses XMLHttpRequest so the UI can show real upload progress (fetch has none).
 */
export function uploadWorkspaceFile(
  file: File,
  contextType: WorkspaceFileContext,
  contextId: string,
  opts?: { onProgress?: (percent: number) => void; signal?: AbortSignal },
): Promise<WorkspaceFileMeta> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${getFilesApiUrl()}/api/workspace/files`)
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

    const form = new FormData()
    form.append("file", file)
    form.append("contextType", contextType)
    form.append("contextId", contextId)
    xhr.send(form)
  })
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

// ── Team storage ──

/** The storage account a team's workspace uploads go to, or null when none is configured. */
export async function getTeamStorage(teamId: string): Promise<TeamStorage | null> {
  try {
    const res = await filesJson<TeamStorage | null>(`/api/workspace/teams/${encodeURIComponent(teamId)}/storage`)
    return res && (res as TeamStorage).accountId ? (res as TeamStorage) : null
  } catch (err) {
    if (err instanceof FilesApiError && err.status === 404) return null
    throw err
  }
}

export async function setTeamStorage(teamId: string, accountId: string): Promise<void> {
  await filesFetch(`/api/workspace/teams/${encodeURIComponent(teamId)}/storage`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountId }),
  })
}

export async function clearTeamStorage(teamId: string): Promise<void> {
  await filesFetch(`/api/workspace/teams/${encodeURIComponent(teamId)}/storage`, { method: "DELETE" })
}

/** The caller's own connected storage accounts (S3-compatible / Telegram), to pick a team storage from. */
export async function listStorageAccounts(): Promise<StorageAccount[]> {
  const res = await filesJson<StorageAccount[]>("/api/account")
  return Array.isArray(res) ? res : []
}

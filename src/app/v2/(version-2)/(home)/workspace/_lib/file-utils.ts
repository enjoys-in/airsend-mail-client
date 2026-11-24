// ---------------------------------------------------------------------------
// File helpers shared by the chat attachments and the team Files tab.
// ---------------------------------------------------------------------------

import type { WorkspaceFile } from "./chat-types";

export type FileKind =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "code"
  | "archive"
  | "other";

const EXT_KIND: Record<string, FileKind> = {
  // images
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", svg: "image", bmp: "image", avif: "image", heic: "image",
  // video / audio
  mp4: "video", mov: "video", webm: "video", mkv: "video", avi: "video",
  mp3: "audio", wav: "audio", ogg: "audio", m4a: "audio", flac: "audio",
  // documents
  pdf: "pdf",
  doc: "document", docx: "document", odt: "document", rtf: "document", txt: "document", md: "document",
  xls: "spreadsheet", xlsx: "spreadsheet", csv: "spreadsheet", ods: "spreadsheet", tsv: "spreadsheet",
  ppt: "presentation", pptx: "presentation", odp: "presentation", key: "presentation",
  // code
  js: "code", ts: "code", tsx: "code", jsx: "code", json: "code", html: "code", css: "code", py: "code", go: "code",
  java: "code", rs: "code", c: "code", cpp: "code", sh: "code", sql: "code", yml: "code", yaml: "code", xml: "code",
  // archives
  zip: "archive", rar: "archive", "7z": "archive", tar: "archive", gz: "archive", tgz: "archive",
};

/** Lower-case extension without the dot ("Report.PDF" -> "pdf"); "" when there is none. */
export function extensionOf(name: string): string {
  const i = name.lastIndexOf(".");
  if (i <= 0 || i === name.length - 1) return "";
  return name.slice(i + 1).toLowerCase();
}

export function fileKind(extension: string | undefined, mimeType?: string): FileKind {
  const ext = (extension ?? "").replace(/^\./, "").toLowerCase();
  if (ext && EXT_KIND[ext]) return EXT_KIND[ext];
  const mime = (mimeType ?? "").toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf") return "pdf";
  return "other";
}

export function isImageFile(extension: string | undefined, mimeType?: string): boolean {
  return fileKind(extension, mimeType) === "image";
}

/** The workspace server's coarse category for the team Files tab filters. */
export function categoryFor(kind: FileKind): WorkspaceFile["category"] {
  switch (kind) {
    case "image":
    case "video":
    case "audio":
      return "media";
    case "pdf":
    case "document":
      return "document";
    case "spreadsheet":
      return "spreadsheet";
    case "presentation":
      return "presentation";
    case "code":
      return "code";
    case "archive":
      return "archive";
    default:
      return "other";
  }
}

export function formatBytes(bytes: number | undefined): string {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  return `${v >= 100 || Number.isInteger(v) ? Math.round(v) : v.toFixed(1)} ${units[u]}`;
}

/** "Nov 25, 2026, 3:04 PM"; "—" when missing or invalid. */
export function formatFileDate(value: string | null | undefined, withTime = true): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return withTime
    ? d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

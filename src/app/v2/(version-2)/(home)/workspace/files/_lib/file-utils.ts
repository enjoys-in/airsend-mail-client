export function formatFileSize(size: unknown): string {
  let num = typeof size === "number" ? size : Number(size);
  if (typeof num !== "number" || isNaN(num) || num < 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let idx = 0;

  while (num >= 1024 && idx < units.length - 1) {
    num /= 1024;
    idx++;
  }

  return `${num.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return "";
  }
  return filename.slice(lastDotIndex + 1).toLowerCase();
}

export function mimeTypeToFileType(mimeType: string): string {
  if (mimeType === "application/vnd.google-apps.folder" || mimeType === "folder") {
    return "folder";
  }

  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  if (mimeType.startsWith("audio/")) {
    return "music";
  }

  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("tar") ||
    mimeType.includes("7z")
  ) {
    return "archive";
  }

  if (
    mimeType.includes("document") ||
    mimeType.includes("pdf") ||
    mimeType.includes("text") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("presentation")
  ) {
    return "document";
  }

  return "file";
}

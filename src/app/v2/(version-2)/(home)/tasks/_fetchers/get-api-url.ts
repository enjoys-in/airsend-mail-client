import { DEFAULT_TASKS_API_URL } from "@tasks/_packages/libs/api-url";

export function getApiUrl(path: string) {
  const trimmedBase = (
    process.env.NEXT_PUBLIC_TASKS_API_URL || DEFAULT_TASKS_API_URL
  ).replace(/\/+$/, "");
  const apiUrl = trimmedBase.endsWith("/api") ? trimmedBase : `${trimmedBase}/api`;
  const normalizedPath = `/${path.replace(/^\/+/, "")}`;

  return `${apiUrl}${normalizedPath}`;
}

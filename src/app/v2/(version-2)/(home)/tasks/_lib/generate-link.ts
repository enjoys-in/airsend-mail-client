import { withTasksBasePath } from "./base-path";

export function generateLink(path = "") {
  const baseUrl =
    process.env.NEXT_PUBLIC_TASKS_APP_URL ||
    `${window.location.protocol}//${window.location.host}`;

  return `${baseUrl}${withTasksBasePath(path)}`;
}

import { withTasksBasePath } from "./base-path";

export function generateLink(path = "") {
  const baseUrl = `${window.location.protocol}//${window.location.host}`;

  return `${baseUrl}${withTasksBasePath(path)}`;
}

import { stripTasksBasePath } from "@tasks/_lib/base-path";
import { hasShellEntered } from "./shell-entered";
import { ShellFrame } from "./shell-frame";

export function isShellPath(pathname: string) {
  const path = pathname.replace(/\/+$/, "");
  return path === "/dashboard" || path.startsWith("/dashboard/workspace/");
}

export function BootFrame() {
  if (hasShellEntered() || !isShellPath(stripTasksBasePath(window.location.pathname))) return null;
  return <ShellFrame />;
}

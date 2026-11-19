/**
 * What the /api/tasks proxy refuses to forward to Kaneo. AirSend owns identity, workspaces, teams and membership
 * (airsend-api and workspace-server write them straight into the tasks schema), so anything that signs a user up,
 * signs them in, or creates / deletes workspaces or changes who belongs to them must not be reachable from the UI.
 */

const READ = new Set(["GET", "HEAD", "OPTIONS"]);

const BLOCKED_AUTH =
  /^auth\/(sign-in|sign-up|forget-password|reset-password|request-password-reset|send-verification|verify-email|email-otp|anonymous|magic-link|change-password|change-email|delete-user|oauth2|device)(\/|$)/;

/** Kaneo's built-in organization endpoints (create/invite/remove members, roles...). Selecting the active one is fine. */
const ORG_MUTATION = /^auth\/organization\/(?!set-active(\/|$))/;

/** A reason when the request must be refused, or null when it may be forwarded. */
export function tasksProxyBlockReason(method: string, rawPath: string): string | null {
  const path = rawPath.split("?")[0].replace(/^\/+|\/+$/g, "").toLowerCase();
  const m = method.toUpperCase();

  if (BLOCKED_AUTH.test(path)) return "Sign-in and sign-up are not available here. Your AirSend account is used.";
  if (ORG_MUTATION.test(path) && !READ.has(m)) return "Workspace members and roles are managed from AirSend.";
  if (path === "workspace" && m === "POST") return "Workspaces are created from AirSend.";
  if (/^workspace\/[^/]+$/.test(path) && m === "DELETE") return "Workspaces are managed from AirSend.";
  if (/^invitation(\/|$)/.test(path) && !READ.has(m)) return "Invitations are managed from AirSend.";
  return null;
}

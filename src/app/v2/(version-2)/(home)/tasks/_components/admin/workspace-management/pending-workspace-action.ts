import type { AdminWorkspace } from "@tasks/_fetchers/admin/workspace-types";

export type PendingWorkspaceAction = {
  type: "archive" | "restore" | "delete";
  workspace: AdminWorkspace;
};

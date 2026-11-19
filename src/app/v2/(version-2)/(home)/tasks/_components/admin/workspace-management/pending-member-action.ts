import type { AdminWorkspaceMember } from "@tasks/_fetchers/admin/workspace-types";

export type PendingMemberAction = {
  type: "transfer" | "remove";
  member: AdminWorkspaceMember;
};

import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";
import type { AdminWorkspaceMemberRoleRequest } from "./workspace-types";

export async function addAdminWorkspaceMember({
  workspaceId,
  userId,
  role,
}: AdminWorkspaceMemberRoleRequest) {
  const response = await client.admin.workspaces[":workspaceId"].members.$post({
    param: { workspaceId },
    json: { userId, role },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

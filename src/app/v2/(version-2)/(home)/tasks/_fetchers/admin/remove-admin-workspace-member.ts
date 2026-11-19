import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";
import type { AdminWorkspaceMemberTarget } from "./workspace-types";

export async function removeAdminWorkspaceMember({
  workspaceId,
  userId,
}: AdminWorkspaceMemberTarget) {
  const response = await client.admin.workspaces[":workspaceId"].members[
    ":userId"
  ].$delete({
    param: { workspaceId, userId },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";

export async function getAdminWorkspaceMembers(workspaceId: string) {
  const response = await client.admin.workspaces[":workspaceId"].members.$get({
    param: { workspaceId },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

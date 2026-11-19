import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";

export async function restoreAdminWorkspace(workspaceId: string) {
  const response = await client.admin.workspaces[":workspaceId"].restore.$post({
    param: { workspaceId },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

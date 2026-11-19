import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";

export async function archiveAdminWorkspace(workspaceId: string) {
  const response = await client.admin.workspaces[":workspaceId"].archive.$post({
    param: { workspaceId },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

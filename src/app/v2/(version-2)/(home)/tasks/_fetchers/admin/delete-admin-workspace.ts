import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";

export async function deleteAdminWorkspace(workspaceId: string) {
  const response = await client.admin.workspaces[":workspaceId"].$delete({
    param: { workspaceId },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

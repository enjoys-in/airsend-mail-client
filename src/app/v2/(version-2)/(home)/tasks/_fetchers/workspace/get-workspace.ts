import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";

async function getWorkspace(workspaceId: string) {
  const response = await client.workspace[":workspaceId"].$get({
    param: { workspaceId },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

export default getWorkspace;

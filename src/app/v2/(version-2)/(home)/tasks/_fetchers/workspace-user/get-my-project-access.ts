import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";

async function getMyProjectAccess(workspaceId: string) {
  const response = await client.workspace[":workspaceId"]["project-access"][
    "me"
  ].$get({ param: { workspaceId } });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

export default getMyProjectAccess;

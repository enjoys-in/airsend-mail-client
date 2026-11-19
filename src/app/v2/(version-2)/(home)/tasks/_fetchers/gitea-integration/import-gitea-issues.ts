import { client } from "@tasks/_packages/libs";

import { HttpError } from "@tasks/_lib/http-error";

async function importGiteaIssues(projectId: string) {
  const response = await client["gitea-integration"]["import-issues"].$post({
    json: { projectId },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

export default importGiteaIssues;

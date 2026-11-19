import { client } from "@tasks/_packages/libs";

import { HttpError } from "@tasks/_lib/http-error";

async function getTaskRelations(taskId: string) {
  const response = await client["task-relation"][":taskId"].$get({
    param: { taskId },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  const data = await response.json();

  return data;
}

export default getTaskRelations;

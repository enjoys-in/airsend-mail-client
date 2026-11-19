import { client } from "@tasks/_packages/libs";

import { HttpError } from "@tasks/_lib/http-error";

async function deleteTaskRelation(id: string) {
  const response = await client["task-relation"][":id"].$delete({
    param: { id },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  const data = await response.json();

  return data;
}

export default deleteTaskRelation;

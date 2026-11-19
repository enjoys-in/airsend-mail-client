import { client } from "@tasks/_packages/libs";

import { HttpError } from "@tasks/_lib/http-error";

async function deleteWorkflowRule(id: string) {
  const response = await client["workflow-rule"][":id"].$delete({
    param: { id },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

export default deleteWorkflowRule;

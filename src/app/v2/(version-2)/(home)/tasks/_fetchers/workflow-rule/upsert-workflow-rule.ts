import { client } from "@tasks/_packages/libs";
import type { InferRequestType } from "hono/client";
import { HttpError } from "@tasks/_lib/http-error";

async function upsertWorkflowRule(
  projectId: string,
  data: InferRequestType<
    (typeof client)["workflow-rule"][":projectId"]["$put"]
  >["json"],
) {
  const response = await client["workflow-rule"][":projectId"].$put({
    param: { projectId },
    json: data,
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

export default upsertWorkflowRule;

import { client } from "@tasks/_packages/libs";

import { HttpError } from "@tasks/_lib/http-error";
export type AttachLabelToTaskRequest = {
  labelId: string;
  taskId: string;
};

async function attachLabelToTask({
  labelId,
  taskId,
}: AttachLabelToTaskRequest) {
  const response = await client.label[":id"].task.$put({
    param: { id: labelId },
    json: { taskId },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

export default attachLabelToTask;

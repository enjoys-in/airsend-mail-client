import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";

async function duplicateTask({
  taskId,
  title,
}: {
  taskId: string;
  title?: string;
}) {
  const response = await client.task.duplicate[":id"].$post({
    param: { id: taskId },
    json: { title },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  const data = await response.json();

  return data;
}

export default duplicateTask;

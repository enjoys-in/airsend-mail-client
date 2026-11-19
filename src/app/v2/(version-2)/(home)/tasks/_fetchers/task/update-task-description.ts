import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";
import type Task from "@tasks/_types/task";

async function updateTaskDescription(taskId: string, task: Task) {
  const response = await client.task.description[":id"].$put({
    param: { id: taskId },
    json: {
      description: task.description || "",
    },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  const data = await response.json();

  return data;
}

export default updateTaskDescription;

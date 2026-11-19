import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";
import type Task from "@tasks/_types/task";

type UpdateTaskAssigneePayload = Pick<Task, "userId">;

async function updateTaskAssignee(
  taskId: string,
  task: UpdateTaskAssigneePayload,
) {
  const response = await client.task.assignee[":id"].$put({
    param: { id: taskId },
    json: {
      userId: task.userId || "",
    },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  const data = await response.json();

  return data;
}

export default updateTaskAssignee;

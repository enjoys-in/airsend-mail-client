import { client } from "@tasks/_packages/libs";

import { HttpError } from "@tasks/_lib/http-error";

async function markAllNotificationsAsRead(workspaceId?: string) {
  const response = await client.notification["read-all"].$patch({
    query: { workspaceId },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  const data = await response.json();
  return data;
}

export default markAllNotificationsAsRead;

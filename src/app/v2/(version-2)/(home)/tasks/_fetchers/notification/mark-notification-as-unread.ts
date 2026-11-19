import { client } from "@tasks/_packages/libs";

import { HttpError } from "@tasks/_lib/http-error";

async function markNotificationAsUnread(id: string) {
  const response = await client.notification[":id"].unread.$patch({
    param: { id },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  const data = await response.json();
  return data;
}

export default markNotificationAsUnread;

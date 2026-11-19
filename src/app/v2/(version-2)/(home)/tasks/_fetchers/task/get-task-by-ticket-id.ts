import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";

async function getTaskByTicketId(ticketId: string, workspaceSlug: string) {
  const response = await client.task["by-ticket-id"][":ticketId"].$get({
    param: { ticketId },
    query: { workspaceSlug },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

export default getTaskByTicketId;

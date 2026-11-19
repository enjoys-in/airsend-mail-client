import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";

export async function deleteAdminWebhook(webhookId: string) {
  const response = await client.admin.webhooks[":webhookId"].$delete({
    param: { webhookId },
  });
  if (!response.ok) throw await HttpError.fromResponse(response);
  return response.json();
}

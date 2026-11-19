import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";

export async function getAdminWebhooks() {
  const response = await client.admin.webhooks.$get();
  if (!response.ok) throw await HttpError.fromResponse(response);
  return response.json();
}

import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";

export async function getAdminUserApiKeys(userId: string) {
  const response = await client.admin.users[":userId"]["api-keys"].$get({
    param: { userId },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

export type AdminApiKey = Awaited<
  ReturnType<typeof getAdminUserApiKeys>
>["apiKeys"][number];

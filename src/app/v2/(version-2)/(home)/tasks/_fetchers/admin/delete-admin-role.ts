import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";

export async function deleteAdminRole(roleId: string) {
  const response = await client.admin.roles[":roleId"].$delete({
    param: { roleId },
  });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

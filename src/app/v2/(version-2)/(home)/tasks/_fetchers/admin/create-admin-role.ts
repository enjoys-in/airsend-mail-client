import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";
import type { AdminRoleValues } from "./role-types";

export async function createAdminRole(json: AdminRoleValues) {
  const response = await client.admin.roles.$post({ json });

  if (!response.ok) {
    throw await HttpError.fromResponse(response);
  }

  return response.json();
}

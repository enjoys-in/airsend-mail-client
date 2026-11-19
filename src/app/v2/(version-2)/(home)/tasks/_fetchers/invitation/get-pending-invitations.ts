import { client } from "@tasks/_packages/libs";
import { HttpError } from "@tasks/_lib/http-error";
import type { WorkspaceUserInvitation } from "@tasks/_types/workspace-user";

export async function getPendingInvitations(): Promise<
  WorkspaceUserInvitation[]
> {
  const response = await client.invitation.pending.$get();

  if (!response.ok) {
    throw new HttpError(response.status, "Failed to get pending invitations");
  }

  return response.json();
}
